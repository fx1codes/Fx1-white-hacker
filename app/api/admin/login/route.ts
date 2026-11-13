import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE, authenticateAdmin, createAdminSession } from "../../../../lib/admin-auth"

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_ATTEMPTS = 5

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return false
  try { return new URL(origin).origin === new URL(request.url).origin } catch { return false }
}

function limited(ip: string) {
  const now = Date.now()
  const current = attempts.get(ip)
  if (!current || current.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  current.count += 1
  return current.count > MAX_ATTEMPTS
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Request origin rejected." }, { status: 403 })
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (limited(ip)) return NextResponse.json({ error: "Too many login attempts. Try again in one minute." }, { status: 429 })

  let body: unknown
  try {
    const raw = await request.text()
    if (raw.length > 2_048) return NextResponse.json({ error: "Request too large." }, { status: 413 })
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: "Invalid login request." }, { status: 400 })
  }

  const email = typeof body === "object" && body !== null && "email" in body && typeof body.email === "string" ? body.email : ""
  const password = typeof body === "object" && body !== null && "password" in body && typeof body.password === "string" ? body.password : ""
  if (email.length > 254 || password.length > 256 || !authenticateAdmin(email, password)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true, email: email.trim().toLowerCase(), role: "admin" })
  response.cookies.set(ADMIN_COOKIE, createAdminSession(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  response.headers.set("Cache-Control", "no-store")
  return response
}
