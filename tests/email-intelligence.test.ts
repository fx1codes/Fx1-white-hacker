import assert from "node:assert/strict"
import test from "node:test"
import { handleEmailIntelligenceRequest } from "../app/api/email-intelligence/route.ts"
import { investigateEmailAddress, type DnsResolver } from "../lib/email-intelligence.ts"

const successfulRecords = {
  mx: [{ exchange: "mx.example.test", priority: 10 }],
  txt: [["v=spf1 include:mail.example.test -all"], ["google-site-verification=example"]],
  dmarc: [["v=DMARC1; p=reject"]],
  ns: ["ns1.example.test"],
}

function resolverFixture(records = successfulRecords, failures: Record<string, string> = {}, hanging: string[] = []): () => DnsResolver {
  return () => {
    const result = (key: string, value: unknown) => {
      if (hanging.includes(key)) return new Promise<never>(() => {})
      if (failures[key]) return Promise.reject(Object.assign(new Error("fixture failure"), { code: failures[key] }))
      return Promise.resolve(value)
    }

    return {
      resolveMx: (domain: string) => result(`mx:${domain}`, records.mx),
      resolveTxt: (domain: string) => domain.startsWith("_dmarc.") ? result(`dmarc:${domain}`, records.dmarc) : result(`txt:${domain}`, records.txt),
      resolveNs: (domain: string) => result(`ns:${domain}`, records.ns),
      cancel: () => undefined,
    } as unknown as DnsResolver
  }
}

async function post(body: string, investigator?: typeof investigateEmailAddress) {
  return handleEmailIntelligenceRequest(new Request("http://localhost/api/email-intelligence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  }), investigator, () => true)
}

test("valid email returns structured DNS results without verifying mailbox ownership", async () => {
  const result = await investigateEmailAddress("Analyst@EXAMPLE.test", { createResolver: resolverFixture() })
  assert.equal(result.email, "Analyst@example.test")
  assert.equal(result.domain, "example.test")
  assert.equal(result.checks.find((check) => check.name === "MX records")?.status, "Confirmed")
  assert.equal(result.checks.find((check) => check.name === "SPF policy")?.status, "Confirmed")
  assert.equal(result.checks.find((check) => check.name === "DMARC policy")?.status, "Confirmed")
  assert.equal(result.checks.find((check) => check.name === "DKIM policy")?.status, "Unable to Check")
  assert.match(result.checks[0].details[0], /mailbox ownership was not checked/)
})

test("invalid email input is rejected before DNS queries", async () => {
  await assert.rejects(() => investigateEmailAddress("bad-address", { createResolver: resolverFixture() }), { name: "EmailValidationError" })
  await assert.rejects(() => investigateEmailAddress("a..b@example.test"), { name: "EmailValidationError" })
})

test("missing MX records are reported as not found", async () => {
  const result = await investigateEmailAddress("person@example.test", { createResolver: resolverFixture(successfulRecords, { "mx:example.test": "ENODATA" }) })
  assert.equal(result.checks.find((check) => check.name === "MX records")?.status, "Not Found")
})

test("missing SPF policy is reported as not found when TXT lookup succeeds", async () => {
  const records = { ...successfulRecords, txt: [["site-verification=example"]] }
  const result = await investigateEmailAddress("person@example.test", { createResolver: resolverFixture(records) })
  assert.equal(result.checks.find((check) => check.name === "SPF policy")?.status, "Not Found")
})

test("missing DMARC policy is reported as not found", async () => {
  const result = await investigateEmailAddress("person@example.test", { createResolver: resolverFixture(successfulRecords, { "dmarc:_dmarc.example.test": "ENODATA" }) })
  assert.equal(result.checks.find((check) => check.name === "DMARC policy")?.status, "Not Found")
})

test("DNS timeout is reported as unavailable", async () => {
  const result = await investigateEmailAddress("person@example.test", { createResolver: resolverFixture(successfulRecords, {}, ["mx:example.test"]), timeoutMs: 5 })
  assert.equal(result.checks.find((check) => check.name === "MX records")?.status, "Unable to Check")
})

test("DNS server failure is reported as unavailable", async () => {
  const result = await investigateEmailAddress("person@example.test", { createResolver: resolverFixture(successfulRecords, { "mx:example.test": "ESERVFAIL" }) })
  assert.equal(result.checks.find((check) => check.name === "MX records")?.status, "Unable to Check")
})

test("unauthenticated API requests are rejected", async () => {
  const response = await handleEmailIntelligenceRequest(new Request("http://localhost/api/email-intelligence", { method: "POST", body: "{}" }), undefined, () => false)
  assert.equal(response.status, 401)
})

test("malformed JSON is rejected with a safe client error", async () => {
  const response = await post("{")
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: "Provide a valid JSON request." })
})

test("invalid email sent through the API returns a validation error", async () => {
  const response = await post(JSON.stringify({ email: "invalid" }))
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /valid email address/)
})

test("unexpected service errors do not expose internal details", async () => {
  const response = await post(JSON.stringify({ email: "person@example.test" }), async () => {
    throw new Error("sensitive internal diagnostic")
  })
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { error: "Email intelligence is temporarily unavailable." })
})

test("successful API response is structured and not cacheable", async () => {
  const response = await post(JSON.stringify({ email: "person@example.test" }), (email) => investigateEmailAddress(email, { createResolver: resolverFixture() }))
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("cache-control"), "no-store")
  const result = await response.json()
  assert.equal(result.domain, "example.test")
  assert.equal(result.checks.length, 7)
})
