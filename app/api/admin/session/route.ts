import { NextResponse } from "next/server"
import { ADMIN_EMAIL, isAdminAuthenticated } from "../../../../lib/admin-auth"

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  return NextResponse.json(
    authenticated ? { authenticated: true, email: ADMIN_EMAIL, role: "admin" } : { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  )
}
