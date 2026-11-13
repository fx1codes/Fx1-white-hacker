import { Resolver } from "node:dns/promises"
import { domainToASCII } from "node:url"

export type CheckStatus = "Confirmed" | "Not Found" | "Unable to Check" | "Not Checked"

export interface EmailCheck {
  name: string
  status: CheckStatus
  confidence: "High" | "Medium" | "Low"
  details: string[]
  source: string
}

export interface EmailInvestigation {
  email: string
  domain: string
  investigatedAt: string
  checks: EmailCheck[]
}

export interface DnsResolver {
  resolveMx(domain: string): Promise<Array<{ exchange: string; priority: number }>>
  resolveTxt(domain: string): Promise<string[][]>
  resolveNs(domain: string): Promise<string[]>
  cancel?(): void
}

export class EmailValidationError extends Error {
  constructor(message = "Enter a valid email address.") {
    super(message)
    this.name = "EmailValidationError"
  }
}

const DNS_TIMEOUT_MS = 4_000
const NOT_FOUND_CODES = new Set(["ENODATA", "ENOTFOUND", "ENONAME", "ENODOMAIN"])

function normalizeEmail(input: unknown): { email: string; domain: string } {
  if (typeof input !== "string" || input.length > 254 || input.trim() !== input) {
    throw new EmailValidationError()
  }

  const separator = input.lastIndexOf("@")
  if (separator < 1 || separator !== input.indexOf("@") || separator === input.length - 1) {
    throw new EmailValidationError()
  }

  const local = input.slice(0, separator)
  const rawDomain = input.slice(separator + 1)
  if (
    local.length > 64 ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    throw new EmailValidationError()
  }

  const domain = domainToASCII(rawDomain).toLowerCase()
  if (
    !domain ||
    domain.length > 253 ||
    !domain.includes(".") ||
    domain.split(".").some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))
  ) {
    throw new EmailValidationError()
  }

  return { email: `${local}@${domain}`, domain }
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code)
    : undefined
}

async function lookup<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(Object.assign(new Error("DNS lookup timed out"), { code: "ETIMEDOUT" })), timeoutMs)
      }),
    ])
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

function unavailableCheck(name: string, source: string, details: string[]): EmailCheck {
  return { name, status: "Unable to Check", confidence: "Low", details, source }
}

async function dnsCheck<T>(
  name: string,
  source: string,
  query: () => Promise<T>,
  summarize: (value: T) => string[],
  timeoutMs: number,
): Promise<EmailCheck> {
  try {
    const value = await lookup(query(), timeoutMs)
    const details = summarize(value)
    return details.length
      ? { name, status: "Confirmed", confidence: "High", details, source }
      : { name, status: "Not Found", confidence: "High", details: ["No matching DNS records were published."], source }
  } catch (error) {
    if (NOT_FOUND_CODES.has(errorCode(error) ?? "")) {
      return { name, status: "Not Found", confidence: "High", details: ["No matching DNS records were published."], source }
    }
    return unavailableCheck(name, source, ["The DNS query could not be completed."])
  }
}

export async function investigateEmailAddress(
  input: unknown,
  options: { createResolver?: () => DnsResolver; timeoutMs?: number } = {},
): Promise<EmailInvestigation> {
  const { email, domain } = normalizeEmail(input)
  const timeoutMs = options.timeoutMs ?? DNS_TIMEOUT_MS
  const createResolver = options.createResolver ?? (() => new Resolver({ timeout: timeoutMs, tries: 1 }) as unknown as DnsResolver)
  const resolver = createResolver()

  const [mx, txt, dmarc, ns] = await Promise.all([
    dnsCheck("MX records", `DNS MX: ${domain}`, () => resolver.resolveMx(domain), (records) =>
      records.map((record) => `${record.exchange} (priority ${record.priority})`), timeoutMs),
    dnsCheck("SPF policy", `DNS TXT: ${domain}`, () => resolver.resolveTxt(domain), (records) => {
      const policies = records.map((record) => record.join("")).filter((record) => /^v=spf1(?:\s|$)/i.test(record))
      return policies.length ? policies : []
    }, timeoutMs),
    dnsCheck("DMARC policy", `DNS TXT: _dmarc.${domain}`, () => resolver.resolveTxt(`_dmarc.${domain}`), (records) => {
      const policies = records.map((record) => record.join("")).filter((record) => /^v=DMARC1(?:;|\s|$)/i.test(record))
      return policies.length ? policies : []
    }, timeoutMs),
    dnsCheck("Nameservers", `DNS NS: ${domain}`, () => resolver.resolveNs(domain), (records) => records, timeoutMs),
  ])

  const dkim: EmailCheck = {
    name: "DKIM policy",
    status: "Unable to Check",
    confidence: "Low",
    details: ["A DKIM selector is required to query a selector-specific public key."],
    source: `DNS TXT: <selector>._domainkey.${domain}`,
  }
  const syntax: EmailCheck = {
    name: "Address syntax",
    status: "Confirmed",
    confidence: "High",
    details: ["The address has a valid basic email structure; mailbox ownership was not checked."],
    source: "Local validation",
  }
  const ownership: EmailCheck = {
    name: "Mailbox ownership",
    status: "Not Checked",
    confidence: "Low",
    details: ["DNS records cannot confirm that a mailbox exists or that a person controls it; no message was sent."],
    source: "Not tested",
  }

  return {
    email,
    domain,
    investigatedAt: new Date().toISOString(),
    checks: [
      { ...mx, details: mx.status === "Confirmed" ? ["MX records were found; mailbox ownership was not checked.", ...mx.details] : mx.details },
      { ...txt, name: "SPF policy" },
      { ...dmarc, name: "DMARC policy" },
      dkim,
      ns,
      syntax,
      ownership,
    ],
  }
}
