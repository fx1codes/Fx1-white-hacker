import test from "node:test"
import assert from "node:assert/strict"
import { AiGatewayError, getAiGatewayStatus, requestAiCompletion } from "../lib/ai-gateway.ts"

test("gateway is disabled by default", () => {
  assert.equal(getAiGatewayStatus({}).enabled, false)
})

test("OpenAI requires a server-side API key and never exposes it in status", () => {
  const missing = getAiGatewayStatus({ FX1_AI_PROVIDER: "openai" })
  assert.equal(missing.enabled, false)
  const ready = getAiGatewayStatus({ FX1_AI_PROVIDER: "openai", OPENAI_API_KEY: "server-secret" })
  assert.equal(ready.enabled, true)
  assert.equal(JSON.stringify(ready).includes("server-secret"), false)
})

test("Ollama rejects remote hosts to prevent SSRF", () => {
  assert.throws(
    () => getAiGatewayStatus({ FX1_AI_PROVIDER: "ollama", OLLAMA_BASE_URL: "http://example.com:11434" }),
    AiGatewayError,
  )
  assert.equal(getAiGatewayStatus({ FX1_AI_PROVIDER: "ollama" }).enabled, true)
})

test("unsupported providers stay disabled", () => {
  assert.equal(getAiGatewayStatus({ FX1_AI_PROVIDER: "custom" }).enabled, false)
})

test("rejects oversized prompts before making a request", async () => {
  await assert.rejects(
    requestAiCompletion("x".repeat(4001), { env: { FX1_AI_PROVIDER: "openai", OPENAI_API_KEY: "test" } }),
    AiGatewayError,
  )
})

test("OpenAI request uses the fixed official endpoint and server key", async () => {
  let capturedUrl = ""
  let capturedHeaders = new Headers()
  let capturedBody: Record<string, unknown> = {}
  const result = await requestAiCompletion("Review this security header.", {
    env: { FX1_AI_PROVIDER: "openai", OPENAI_API_KEY: "secret-key", OPENAI_MODEL: "gpt-4o-mini" },
    fetcher: async (input, init) => {
      capturedUrl = String(input)
      capturedHeaders = new Headers(init?.headers)
      capturedBody = JSON.parse(String(init?.body))
      return Response.json({ choices: [{ message: { content: "Use a strict CSP." } }] })
    },
  })
  assert.equal(capturedUrl, "https://api.openai.com/v1/chat/completions")
  assert.equal(capturedHeaders.get("authorization"), "Bearer secret-key")
  assert.equal(capturedBody.max_tokens, 700)
  assert.equal(result.text, "Use a strict CSP.")
  assert.equal(result.provider, "openai")
})

test("Ollama request uses only the loopback configured endpoint", async () => {
  let capturedUrl = ""
  const result = await requestAiCompletion("Explain a safe configuration.", {
    env: { FX1_AI_PROVIDER: "ollama", OLLAMA_BASE_URL: "http://127.0.0.1:11434", OLLAMA_MODEL: "llama3.2" },
    fetcher: async (input) => {
      capturedUrl = String(input)
      return Response.json({ message: { content: "Use least privilege." } })
    },
  })
  assert.equal(capturedUrl, "http://127.0.0.1:11434/api/chat")
  assert.equal(result.text, "Use least privilege.")
})

test("provider errors do not leak response bodies", async () => {
  await assert.rejects(
    requestAiCompletion("hello", {
      env: { FX1_AI_PROVIDER: "openai", OPENAI_API_KEY: "secret" },
      fetcher: async () => new Response("private provider detail", { status: 500 }),
    }),
    (error: unknown) => error instanceof AiGatewayError && !error.message.includes("private provider detail"),
  )
})
