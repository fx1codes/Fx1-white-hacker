"use client"

import { useState, type FormEvent } from "react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("fx1faucet@gmail.com")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setBusy(true)
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      })
      const result: unknown = await response.json()
      if (!response.ok) {
        setError(typeof result === "object" && result !== null && "error" in result && typeof result.error === "string" ? result.error : "Sign-in failed.")
        return
      }
      window.location.assign("/")
    } catch {
      setError("Unable to reach the sign-in service.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050b1c] px-5 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-[#243b76] bg-[#0a1630] p-7 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7da5ff]">FX1 SHADOWCORE</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Administrator sign in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">This workspace is restricted to its configured administrator.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-xs font-medium text-slate-300">Administrator email
            <input type="email" required maxLength={254} autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#050b1c] px-4 py-3 text-sm text-white outline-none focus:border-[#7da5ff]" />
          </label>
          <label className="block text-xs font-medium text-slate-300">Administrator password
            <input type="password" required maxLength={256} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-[#050b1c] px-4 py-3 text-sm text-white outline-none focus:border-[#7da5ff]" />
          </label>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0504AA] hover:bg-[#e7ebff] disabled:opacity-60">{busy ? "Signing in…" : "Sign in securely"}</button>
        </form>
        <p className="mt-5 text-xs leading-5 text-slate-500">Admin access is granted only after server-side credential verification. Sessions are signed, HTTP-only, and expire after 12 hours.</p>
      </section>
    </main>
  )
}
