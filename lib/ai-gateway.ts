export type AiProvider = "openai" | "ollama"
export type GatewayEnvironment = Record<string, string | undefined>

export interface AiGatewayStatus {
  enabled: boolean
  provider: AiProvider | null
  model: string | null
  reason?: string
}

export interface AiCompletion {
  provider: AiProvider
  model: string
  text: string
}

export class AiGatewayError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AiGatewayError"
  }
}

const MAX_INPUT_LENGTH = 4_000
const MAX_OUTPUT_TOKENS = 700
const REQUEST_TIMEOUT_MS = 20_000
const MODEL_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,99}$/

function assertServerRuntime() {
  if (typeof window !== "undefined") {
    throw new AiGatewayError("The AI gateway can only run on the server.")
  }
}

function safeModel(value: string | undefined, fallback: string): string {
  const model = value?.trim() || fallback
  if (!MODEL_PATTERN.test(model)) throw new AiGatewayError("The configured AI model name is invalid.")
  return model
}

function loopbackOllamaUrl(value: string | undefined): URL {
  let url: URL
  try {
    url = new URL(value?.trim() || "http://127.0.0.1:11434")
  } catch {
    throw new AiGatewayError("Ollama must use a valid local HTTP URL.")
  }
  const hosts = new Set(["127.0.0.1", "localhost", "[::1]"])
  if (url.protocol !== "http:" || !hosts.has(url.hostname) || url.username || url.password || url.search || url.hash) {
    throw new AiGatewayError("Ollama is restricted to HTTP on localhost; remote URLs are not allowed.")
  }
  return url
}

export function getAiGatewayStatus(env: GatewayEnvironment = process.env): AiGatewayStatus {
  const rawProvider = env.FX1_AI_PROVIDER?.trim().toLowerCase()
  if (!rawProvider || rawProvider === "disabled") {
    return { enabled: false, provider: null, model: null, reason: "AI provider is not configured." }
  }
  if (rawProvider === "openai") {
    if (!env.OPENAI_API_KEY?.trim()) {
      return { enabled: false, provider: "openai", model: null, reason: "OpenAI server credentials are not configured." }
    }
    return { enabled: true, provider: "openai", model: safeModel(env.OPENAI_MODEL, "gpt-4o-mini") }
  }
  if (rawProvider === "ollama") {
    const model = safeModel(env.OLLAMA_MODEL, "llama3.2")
    loopbackOllamaUrl(env.OLLAMA_BASE_URL)
    return { enabled: true, provider: "ollama", model }
  }
  return { enabled: false, provider: null, model: null, reason: "Unsupported AI provider." }
}

function extractText(payload: unknown, provider: AiProvider): string {
  if (typeof payload !== "object" || payload === null) {
    throw new AiGatewayError("The AI provider returned an invalid response.")
  }
  let content: unknown
  if (provider === "openai" && "choices" in payload && Array.isArray(payload.choices)) {
    const first = payload.choices[0]
    if (typeof first === "object" && first !== null && "message" in first &&
      typeof first.message === "object" && first.message !== null && "content" in first.message) {
      content = first.message.content
    }
  }
  if (provider === "ollama" && "message" in payload &&
    typeof payload.message === "object" && payload.message !== null && "content" in payload.message) {
    content = payload.message.content
  }
  if (typeof content !== "string" || !content.trim()) {
    throw new AiGatewayError("The AI provider returned no usable text.")
  }
  return content.slice(0, 12_000)
}

export async function requestAiCompletion(
  input: string,
  options: {
    env?: GatewayEnvironment
    fetcher?: typeof fetch
  } = {},
): Promise<AiCompletion> {
  assertServerRuntime()
  if (typeof input !== "string" || !input.trim() || input.length > MAX_INPUT_LENGTH) {
    throw new AiGatewayError(`Prompt must contain 1 to ${MAX_INPUT_LENGTH} characters.`)
  }

  const env = options.env ?? process.env
  const status = getAiGatewayStatus(env)
  if (!status.enabled || !status.provider || !status.model) {
    throw new AiGatewayError(status.reason ?? "AI gateway is disabled.")
  }

  const fetcher = options.fetcher ?? fetch
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    let endpoint: URL
    let headers: Record<string, string>
    let body: Record<string, unknown>

    if (status.provider === "openai") {
      endpoint = new URL("https://api.openai.com/v1/chat/completions")
      headers = {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      }
      body = {
        model: status.model,
        messages: [
          { role: "system", content: "You are FX1 SHADOWCORE's defensive security assistant. Give cautious, authorized, defensive guidance. Do not provide instructions for credential theft, stealth, malware, or unauthorized access." },
          { role: "user", content: input.trim() },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }
    } else {
      const base = loopbackOllamaUrl(env.OLLAMA_BASE_URL)
      endpoint = new URL("/api/chat", base)
      headers = { "Content-Type": "application/json", Accept: "application/json" }
      body = {
        model: status.model,
        stream: false,
        messages: [
          { role: "system", content: "You are FX1 SHADOWCORE's defensive security assistant. Give cautious, authorized, defensive guidance. Do not provide instructions for credential theft, stealth, malware, or unauthorized access." },
          { role: "user", content: input.trim() },
        ],
        options: { num_predict: MAX_OUTPUT_TOKENS },
      }
    }

    const response = await fetcher(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new AiGatewayError(response.status === 429
        ? "The AI provider rate limit was reached."
        : "The AI provider request failed.")
    }
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new AiGatewayError("The AI provider returned invalid JSON.")
    }
    return { provider: status.provider, model: status.model, text: extractText(payload, status.provider) }
  } catch (error) {
    if (error instanceof AiGatewayError) throw error
    if (controller.signal.aborted) throw new AiGatewayError("The AI request timed out.")
    throw new AiGatewayError("The AI provider could not be reached.")
  } finally {
    clearTimeout(timeout)
  }
}
