import test from "node:test"
import assert from "node:assert/strict"
import { normalizePublicHostname } from "../lib/assessment-scope.ts"

test("normalizes valid public DNS hostnames", () => {
  assert.equal(normalizePublicHostname(" Example.COM. "), "example.com")
  assert.equal(normalizePublicHostname("security.example.co.uk"), "security.example.co.uk")
})

test("rejects IP addresses, localhost, wildcard and malformed scopes", () => {
  for (const value of ["127.0.0.1", "::1", "localhost", "api.localhost", "*.example.com", "https://example.com", "-bad.example.com", "bad..example.com", "example"]) {
    assert.equal(normalizePublicHostname(value), null, value)
  }
})
