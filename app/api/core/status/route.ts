import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "../../../../lib/admin-auth.ts"

const disconnected = (message: string, status = 503) =>
  NextResponse.json(
    { state: "disconnected", service: "FX1 Core Bridge", message },
    { status, headers: { "Cache-Control": "no-store" } },
  )

function configuredLoopbackUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    const allowedHosts = new Set(["127.0.0.1", "localhost", "[::1]", "::1"])
    if (url.protocol !== "http:" || !allowedHosts.has(url.hostname) || url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Administrator authentication required." }, { status: 401, headers: { "Cache-Control": "no-store" } })
  }
  const configuredUrl = process.env.FX1_CORE_ENGINE_URL
  const token = process.env.FX1_CORE_TOKEN

  if (!configuredUrl || !token) {
    return disconnected("Local engine is not configured on this application host.")
  }

  const baseUrl = configuredLoopbackUrl(configuredUrl)
  if (!baseUrl) {
    return disconnected("Engine URL must use HTTP on localhost or 127.0.0.1 only.", 500)
  }

  try {
    const target = new URL("/api/v1/status", baseUrl)
    const response = await fetch(target, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    })

    if (!response.ok) return disconnected("Local engine did not authorize the status request.", 502)

    const payload: unknown = await response.json()
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("state" in payload) ||
      payload.state !== "connected" ||
      !("service" in payload) ||
      typeof payload.service !== "string"
    ) {
      return disconnected("Local engine returned an invalid status response.", 502)
    }

    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return disconnected("Local engine is unreachable from this application host.")
  }
}
