import test from "node:test"
import assert from "node:assert/strict"
import { authenticateAdmin, createAdminSession, verifyAdminSession } from "../lib/admin-session.ts"

process.env.FX1_ADMIN_EMAIL = "fx1faucet@gmail.com"
process.env.FX1_ADMIN_PASSWORD = "a-very-long-test-password"
process.env.FX1_SESSION_SECRET = "test-session-secret-that-is-at-least-32-characters"

test("only the configured admin email and password authenticate", () => {
  assert.equal(authenticateAdmin("fx1faucet@gmail.com", "a-very-long-test-password"), true)
  assert.equal(authenticateAdmin("someone@example.com", "a-very-long-test-password"), false)
  assert.equal(authenticateAdmin("fx1faucet@gmail.com", "wrong-password"), false)
})

test("signed admin sessions validate and expire", () => {
  const now = 1_800_000_000_000
  const token = createAdminSession("fx1faucet@gmail.com", now)
  assert.equal(verifyAdminSession(token, now), true)
  assert.equal(verifyAdminSession(token, now + 13 * 60 * 60 * 1000), false)
})

test("tampered and malformed sessions are rejected", () => {
  const token = createAdminSession("fx1faucet@gmail.com")
  assert.equal(verifyAdminSession(token + "x"), false)
  assert.equal(verifyAdminSession("not-a-session"), false)
  assert.equal(verifyAdminSession(undefined), false)
})

test("missing or short server secrets fail closed", () => {
  const original = process.env.FX1_SESSION_SECRET
  const token = createAdminSession("fx1faucet@gmail.com")
  process.env.FX1_SESSION_SECRET = "short"
  assert.equal(verifyAdminSession(token), false)
  process.env.FX1_SESSION_SECRET = original
})
