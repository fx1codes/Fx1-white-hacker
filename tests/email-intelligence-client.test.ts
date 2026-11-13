import assert from "node:assert/strict"
import test from "node:test"
import { requestEmailInvestigation } from "../lib/email-intelligence-client.ts"

const result = {
  email: "person@example.test",
  domain: "example.test",
  investigatedAt: "2026-01-01T00:00:00.000Z",
  checks: [{ name: "MX records", status: "Confirmed", confidence: "High", details: ["mx.example.test"], source: "DNS MX: example.test" }],
}

test("frontend client sends the email and returns structured results", async () => {
  let requestedUrl = ""
  let requestedBody = ""
  const fetcher: typeof fetch = async (input, init) => {
    requestedUrl = String(input)
    requestedBody = String(init?.body)
    return Response.json(result)
  }

  assert.deepEqual(await requestEmailInvestigation("person@example.test", fetcher), result)
  assert.equal(requestedUrl, "/api/email-intelligence")
  assert.equal(requestedBody, JSON.stringify({ email: "person@example.test" }))
})

test("frontend client displays safe API errors", async () => {
  const fetcher: typeof fetch = async () => Response.json({ error: "Enter a valid email address." }, { status: 400 })
  await assert.rejects(() => requestEmailInvestigation("bad", fetcher), { message: "Enter a valid email address." })
})

test("frontend client rejects malformed success responses", async () => {
  const fetcher: typeof fetch = async () => Response.json({ checks: [] })
  await assert.rejects(() => requestEmailInvestigation("person@example.test", fetcher), { message: "The investigation returned an invalid response." })
})

test("frontend client reports malformed JSON responses", async () => {
  const fetcher: typeof fetch = async () => new Response("not-json", { status: 200 })
  await assert.rejects(() => requestEmailInvestigation("person@example.test", fetcher), { message: "The investigation returned an invalid response." })
})
