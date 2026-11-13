import { NextRequest, NextResponse } from "next/server"
import { ADMIN_COOKIE } from "../../../../lib/admin-auth"

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  try {
    if (!origin || new URL(origin).origin !== new URL(request.url).origin) {
      return NextResponse.json({ error: "Request origin rejected." }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: "Request origin rejected." }, { status: 403 })
  }
  const response = NextResponse.json({ authenticated: false })
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
  response.headers.set("Cache-Control", "no-store")
  return response
}
