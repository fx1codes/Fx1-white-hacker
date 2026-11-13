import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifyAdminSession } from "./admin-session"

export * from "./admin-session"

export async function isAdminAuthenticated() {
  const jar = await cookies()
  return verifyAdminSession(jar.get(ADMIN_COOKIE)?.value)
}
