# FX1 AI Gateway foundation

This is a server-side provider adapter foundation for the SHADOWCORE AI Analyst. It is deliberately not wired to a public API route or browser control yet: the dashboard currently has no user authentication/session layer, so exposing a paid inference endpoint now would allow anonymous usage and cost abuse.

## Providers

Set these only in the server environment (Vercel Project Settings → Environment Variables, or the local server environment):

### OpenAI
- `FX1_AI_PROVIDER=openai`
- `OPENAI_API_KEY=<private server-side key>`
- Optional: `OPENAI_MODEL=gpt-4o-mini`

The adapter calls only the official OpenAI Chat Completions endpoint. The API key is never returned by status helpers or sent to browser code.

### Local Ollama
- `FX1_AI_PROVIDER=ollama`
- Optional: `OLLAMA_MODEL=llama3.2`
- Optional: `OLLAMA_BASE_URL=http://127.0.0.1:11434`

Ollama URLs are restricted to HTTP loopback addresses to prevent server-side request forgery. A hosted Vercel function cannot reach Ollama running on a phone or personal computer; this provider is for a Next.js server and Ollama running on the same host. Do not expose Ollama publicly.

## Server-side usage

Import `getAiGatewayStatus` and `requestAiCompletion` from `lib/ai-gateway.ts` only in server-side code. The adapter:
- is disabled unless a provider is explicitly configured;
- requires an OpenAI key when OpenAI is selected;
- uses fixed provider endpoints (no client-supplied URL);
- limits prompts to 4,000 characters and output to 700 tokens;
- applies a 20-second request timeout;
- returns generic provider errors without leaking response bodies;
- includes a defensive security system instruction.

Do not expose this function through a public route until FX1 has a real authentication/session layer, per-user authorization, rate limiting, and usage/cost controls. No API keys are committed to the repository.
