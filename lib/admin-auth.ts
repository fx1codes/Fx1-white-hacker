import { createHmac, createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_EMAIL = (process.env.FX1_ADMIN_EMAIL || "fx1faucet@gmail.com").trim().toLowerCase()
export const ADMIN_COOKIE = "fx1_admin_session"
const SESSION_SECONDS = 60 * 60 * 12

function secret() {
  const value = process.env.FX1_SESSION_SECRET
  if (!value || value.length < 32) throw new Error("FX1_SESSION_SECRET must contain at least 32 characters.")
  return value
}

function passwordHash(value: string) {
  return createHash("sha256").update(value, "utf8").digest()
}

function equalSecret(a: string, b: string) {
  const left = passwordHash(a)
  const right = passwordHash(b)
  return timingSafeEqual(left, right)
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function createAdminSession(email: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    sub: email.toLowerCase(),
    role: "admin",
    exp: Math.floor(now / 1000) + SESSION_SECONDS,
  })).toString("base64url")
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSession(token: string | undefined, now = Date.now()) {
  if (!token) return false
  try {
    const [payload, signature, extra] = token.split(".")
    if (!payload || !signature || extra) return false
    const expected = sign(payload)
    if (!equalSecret(signature, expected)) return false
    const decoded: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    if (typeof decoded !== "object" || decoded === null) return false
    if (!("sub" in decoded) || decoded.sub !== ADMIN_EMAIL) return false
    if (!("role" in decoded) || decoded.role !== "admin") return false
    if (!("exp" in decoded) || typeof decoded.exp !== "number" || decoded.exp <= Math.floor(now / 1000)) return false
    return true
  } catch {
    return false
  }
}

export function authenticateAdmin(email: string, password: string) {
  const configuredPassword = process.env.FX1_ADMIN_PASSWORD
  if (!configuredPassword || configuredPassword.length < 16) return false
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) return false
  return equalSecret(password, configuredPassword)
}

export async function isAdminAuthenticated() {
  const jar = await cookies()
  return verifyAdminSession(jar.get(ADMIN_COOKIE)?.value)
}
