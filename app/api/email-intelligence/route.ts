import { Resolver } from "node:dns/promises"
import { domainToASCII } from "node:url"

const dnsTimeoutMs = 3_000

type Status = "Confirmed" | "Possible" | "Not Found" | "Unable to Check"

type Check = {
  name: string
  status: Status
  confidence: "High" | "Medium" | "Low" | "None"
  details: string[]
  source: string
}

async function lookup<T>(operation: (resolver: Resolver) => Promise<T>) {
  const resolver = new Resolver()
  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    resolver.cancel()
  }, dnsTimeoutMs)

  try {
    return { records: await operation(resolver), available: true }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    return { records: null, available: !timedOut && code !== "ETIMEOUT" && code !== "ESERVFAIL" && code !== "ECONNREFUSED" && code !== "EREFUSED" }
  } finally {
    clearTimeout(timeout)
  }
}

function recordCheck(name: string, result: { records: unknown; available: boolean }, details: string[], source: string): Check {
  const records = result.records as unknown[] | null
  return {
    name,
    status: records?.length ? "Confirmed" : result.available ? "Not Found" : "Unable to Check",
    confidence: records?.length ? "High" : result.available ? "High" : "None",
    details: records?.length ? details : [],
    source,
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > 1_024) {
    return Response.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } })
  }

  let body: unknown
  try {
    const requestBody = await request.text()
    if (requestBody.length > 1_024) {
      return Response.json({ error: "Request body is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } })
    }
    body = JSON.parse(requestBody)
  } catch {
    return Response.json({ error: "Provide a valid JSON request." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const email = typeof body === "object" && body !== null && "email" in body && typeof body.email === "string" ? body.email.trim() : ""
  if (email.length > 254) {
    return Response.json({ error: "Email address must be 254 characters or fewer." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const separator = email.lastIndexOf("@")
  const localPart = email.slice(0, separator)
  const domain = domainToASCII(email.slice(separator + 1).toLowerCase())
  const validLocalPart = localPart.length > 0 && localPart.length <= 64 && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart) && !localPart.startsWith(".") && !localPart.endsWith(".") && !localPart.includes("..")
  const validDomain = domain.length <= 253 && domain.includes(".") && domain.split(".").every((label) => label.length > 0 && label.length <= 63 && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))

  if (separator < 1 || email.indexOf("@") !== separator || !validLocalPart || !validDomain) {
    return Response.json({ error: "Enter a valid email address with a public domain." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const [mxResult, txtResult, dmarcResult, nsResult] = await Promise.all([
    lookup((resolver) => resolver.resolveMx(domain)),
    lookup((resolver) => resolver.resolveTxt(domain)),
    lookup((resolver) => resolver.resolveTxt(`_dmarc.${domain}`)),
    lookup((resolver) => resolver.resolveNs(domain)),
  ])

  const txtRecords = txtResult.records as string[][] | null
  const spfRecords = txtRecords?.flat().filter((record) => record.toLowerCase().startsWith("v=spf1")) ?? []
  const dmarcRecords = (dmarcResult.records as string[][] | null)?.flat().filter((record) => record.toLowerCase().startsWith("v=dmarc1")) ?? []
  const mxRecords = (mxResult.records as { exchange: string; priority: number }[] | null)?.map((record) => `${record.exchange} (priority ${record.priority})`) ?? []
  const nsRecords = (nsResult.records as string[] | null) ?? []

  const checks: Check[] = [
    {
      name: "Email syntax",
      status: "Confirmed",
      confidence: "High",
      details: ["Address format is valid; mailbox ownership was not checked."],
      source: "Local format validation",
    },
    recordCheck("MX records", mxResult, mxRecords, `DNS MX: ${domain}`),
    {
      name: "SPF policy",
      status: spfRecords.length ? "Confirmed" : txtResult.available ? "Not Found" : "Unable to Check",
      confidence: spfRecords.length ? "High" : txtResult.available ? "High" : "None",
      details: spfRecords,
      source: `DNS TXT: ${domain}`,
    },
    {
      name: "DMARC policy",
      status: dmarcRecords.length ? "Confirmed" : dmarcResult.available ? "Not Found" : "Unable to Check",
      confidence: dmarcRecords.length ? "High" : dmarcResult.available ? "High" : "None",
      details: dmarcRecords,
      source: `DNS TXT: _dmarc.${domain}`,
    },
    recordCheck("Name servers", nsResult, nsRecords, `DNS NS: ${domain}`),
    {
      name: "DKIM policy",
      status: "Unable to Check",
      confidence: "None",
      details: [],
      source: "A DKIM selector is required; none was supplied.",
    },
    {
      name: "Public references and breach exposure",
      status: "Unable to Check",
      confidence: "None",
      details: [],
      source: "No authorized public-reference or breach-intelligence provider is configured.",
    },
  ]

  return Response.json({
    email: `${localPart}@${domain}`,
    domain,
    investigatedAt: new Date().toISOString(),
    checks,
  }, { headers: { "Cache-Control": "no-store" } })
}
