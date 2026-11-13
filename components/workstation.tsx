"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { requestEmailInvestigation } from "@/lib/email-intelligence-client"
import { AssessmentWorkspace } from "@/components/assessment-workspace"
import type { EmailInvestigation } from "@/lib/email-intelligence"
import {
  Activity,
  AlertTriangle,
  Bot,
  ChevronRight,
  FileText,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  LogOut,
  LockKeyhole,
  Mail,
  Menu,
  Network,
  Search,
  ScanSearch,
  Settings2,
  Shield,
  Smartphone,
  Wifi,
  X,
} from "lucide-react"

const logoUrl = "https://cdn.builder.io/api/v1/image/assets%2Fa7d10ba2a7f54019b832d6402a7b5531%2Fc6f091693f4140e8ac258419f8dee122?format=webp&width=800&height=1200"

const modules = [
  { name: "Network Analysis", detail: "Assessment integration not configured", icon: Network },
  { name: "Web & API Security", detail: "Assessment integration not configured", icon: Globe2 },
  { name: "Password Auditing", detail: "Offline audit engine not configured", icon: LockKeyhole },
  { name: "Wireless Security", detail: "Local adapter integration not configured", icon: Wifi },
  { name: "Android Security", detail: "Static analysis tools not configured", icon: Smartphone },
  { name: "Digital Forensics", detail: "Evidence workspace not configured", icon: Fingerprint },
]

const navItems = [
  { label: "Command Center", icon: LayoutDashboard, available: true },
  { label: "Email Intelligence", icon: Mail, available: true },
  { label: "Assessment Workspace", icon: ScanSearch, available: true },
  { label: "Security Modules", icon: ScanSearch, available: false },
  { label: "Findings & Evidence", icon: Shield, available: false },
  { label: "Reports", icon: FileText, available: false },
  { label: "AI Analyst", icon: Bot, available: false },
]

export function Workstation() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState("Command Center")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [investigation, setInvestigation] = useState<EmailInvestigation | null>(null)
  const [investigationError, setInvestigationError] = useState("")
  const [isInvestigating, setIsInvestigating] = useState(false)
  const [coreStatus, setCoreStatus] = useState<"checking" | "connected" | "disconnected">("checking")

  useEffect(() => {
    let active = true
    fetch("/api/core/status", { cache: "no-store" })
      .then(async (response) => {
        const payload: unknown = await response.json()
        if (!active) return
        setCoreStatus(response.ok && typeof payload === "object" && payload !== null && "state" in payload && payload.state === "connected" ? "connected" : "disconnected")
      })
      .catch(() => { if (active) setCoreStatus("disconnected") })
    return () => { active = false }
  }, [])

  async function investigateEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInvestigation(null)
    setInvestigationError("")
    setIsInvestigating(true)

    try {
      setInvestigation(await requestEmailInvestigation(email))
    } catch (error) {
      setInvestigationError(error instanceof Error ? error.message : "The investigation could not be completed.")
    } finally {
      setIsInvestigating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050b1c] text-slate-100">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#07132e] px-5 py-5 transition-transform lg:static lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-xl border border-[#0504AA]/70 bg-[#0504AA] shadow-[0_0_24px_rgba(5,4,170,0.55)]">
                <img src={logoUrl} alt="FX1 SHADOWCORE logo" className="h-full w-full object-cover object-top" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-white">FX1</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">SHADOWCORE</p>
              </div>
            </div>
            <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"><X /></button>
          </div>

          <div className="mt-10 rounded-2xl border border-[#243b76] bg-[#0b1d43] p-4">
            <div className={`flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] ${coreStatus === "connected" ? "text-emerald-300" : coreStatus === "checking" ? "text-sky-300" : "text-amber-300"}`}>
              <span className={`size-2 rounded-full ${coreStatus === "connected" ? "bg-emerald-300" : coreStatus === "checking" ? "bg-sky-300 animate-pulse" : "bg-amber-300"}`} />
              {coreStatus === "connected" ? "Core Engine Connected" : coreStatus === "checking" ? "Checking Core Engine" : "Core Engine Disconnected"}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              {coreStatus === "connected" ? "Authenticated local status bridge is responding." : coreStatus === "checking" ? "Checking the configured local bridge." : "No authenticated local FX1 Core Engine is reachable from this application host."}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-500"><span>Integration</span><span>{coreStatus === "connected" ? "Connected" : coreStatus === "checking" ? "Checking" : "Not connected"}</span></div>
          </div>

          <nav className="mt-8 flex-1" aria-label="Primary navigation">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeNav === item.label
                return <button key={item.label} disabled={!item.available} onClick={() => { setActiveNav(item.label); setMobileNavOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-[#0504AA] text-white shadow-[0_8px_24px_rgba(5,4,170,0.28)]" : item.available ? "text-slate-400 hover:bg-white/5 hover:text-slate-200" : "cursor-not-allowed text-slate-600"}`}><Icon className="size-4" />{item.label}{active && <ChevronRight className="ml-auto size-4" />}{!item.available && <span className="ml-auto text-[9px] uppercase tracking-wider">Planned</span>}</button>
              })}
            </div>
            <p className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">System</p>
            <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600"><Settings2 className="size-4" />Workspace Settings <span className="ml-auto text-[9px] uppercase tracking-wider">Planned</span></div>
          </nav>

          <div className="border-t border-white/10 pt-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">FX</div><div className="min-w-0"><p className="truncate text-xs font-medium text-white">FX1 Administrator</p><p className="truncate text-[11px] text-slate-500">fx1faucet@gmail.com</p></div><span className="ml-auto text-[9px] uppercase tracking-wider text-emerald-300">Admin</span></div></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#07132e]/85 px-5 backdrop-blur-xl lg:px-9">
            <div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"><Menu /></button><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7da5ff]">FX1 SHADOWCORE</p><h1 className="mt-1 text-xl font-semibold tracking-tight text-white">{activeNav}</h1></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-500 sm:flex"><Search className="size-3.5" /> Search unavailable</div><span className="rounded-xl border border-white/10 p-2.5 text-slate-500" aria-label="Notifications not configured" title="Notifications not configured"><AlertTriangle className="size-4" /></span><button onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin-login") }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5" aria-label="Sign out"><LogOut className="size-4" /><span className="hidden sm:inline">Sign out</span></button></div>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 lg:p-9">
            {activeNav === "Assessment Workspace" ? (
              <AssessmentWorkspace />
            ) : activeNav === "Email Intelligence" ? (
              <section className="rounded-3xl border border-[#243b76] bg-[radial-gradient(circle_at_top_right,rgba(5,4,170,0.3),transparent_36%),linear-gradient(115deg,#0b1e49,#081432)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] lg:p-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4e70ce]/40 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#b5c8ff]"><Mail className="size-3.5" /> Passive domain checks</div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">Email Intelligence</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Check address syntax and public DNS configuration for the email domain. This does not verify mailbox ownership or perform account discovery.</p>
                <form onSubmit={investigateEmail} className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
                  <label className="sr-only" htmlFor="email-address">Email address</label>
                  <input id="email-address" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#050b1c] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#7da5ff]" />
                  <button type="submit" disabled={isInvestigating} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0504AA] transition hover:bg-[#e7ebff] disabled:cursor-wait disabled:opacity-60">{isInvestigating ? "Checking DNS…" : "Start Investigation"}</button>
                </form>
                {investigationError && <p role="alert" className="mt-4 text-sm text-rose-300">{investigationError}</p>}
                {investigation && <div className="mt-7 max-w-4xl rounded-2xl border border-white/10 bg-[#07132e]/80 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-4"><div><p className="text-sm font-medium text-white">{investigation.email}</p><p className="mt-1 text-xs text-slate-400">Domain: {investigation.domain}</p></div><time className="text-xs text-slate-500">{new Date(investigation.investigatedAt).toLocaleString()}</time></div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">{investigation.checks.map((check) => <article key={check.name} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium text-slate-100">{check.name}</h3><span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${check.status === "Confirmed" ? "text-emerald-300" : check.status === "Not Found" ? "text-amber-300" : "text-slate-400"}`}>{check.status}</span></div><p className="mt-2 text-xs text-slate-400">Confidence: {check.confidence}</p>{check.details.map((detail) => <p key={detail} className="mt-2 break-all text-xs leading-5 text-slate-300">{detail}</p>)}<p className="mt-3 break-all text-[10px] text-slate-500">Source: {check.source}</p></article>)}</div>
                  <p className="mt-4 text-xs leading-5 text-slate-500">DNS records indicate domain configuration only; they do not establish that this mailbox exists or that a person controls it. Results are not stored.</p>
                </div>}
              </section>
            ) : <>
            <section className="relative overflow-hidden rounded-3xl border border-[#243b76] bg-[radial-gradient(circle_at_top_right,rgba(5,4,170,0.45),transparent_36%),linear-gradient(115deg,#0b1e49,#081432)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] lg:p-8">
              <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-[#3156b4]/30" /><div className="pointer-events-none absolute -right-5 -top-12 size-52 rounded-full border border-[#3156b4]/25" />
              <div className="relative max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4e70ce]/40 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#b5c8ff]"><Activity className="size-3.5" /> Mission control</div><h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Defend the surface.<br /><span className="text-[#7da5ff]">Know the system.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">A defensive security workstation in development. Assessment execution, persistence, authentication, and audit logging are not connected yet.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={() => setActiveNav("Email Intelligence")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0504AA] shadow-lg transition hover:bg-[#e7ebff]"><Mail className="size-4" /> Email Intelligence</button><span className="inline-flex items-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-400">Assessment runner not connected</span></div></div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[{ label: "Assessment history", value: "Not connected", detail: "No persistent job store" }, { label: "Findings", value: "Not available", detail: "No assessment results" }, { label: "Core Engine", value: "Not installed", detail: "No local engine connected" }, { label: "Authentication", value: "Not configured", detail: "No identity provider connected" }].map((status) => <article key={status.label} className="rounded-2xl border border-white/10 bg-[#0a1630] p-5"><p className="text-xs text-slate-400">{status.label}</p><p className="mt-4 text-lg font-semibold tracking-tight text-white">{status.value}</p><p className="mt-2 text-xs text-slate-500">{status.detail}</p></article>)}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7da5ff]">Capability matrix</p><h3 className="mt-2 text-lg font-semibold text-white">Security modules</h3></div><span className="text-[10px] uppercase tracking-wider text-slate-500">Integrations pending</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{modules.map((module) => { const Icon = module.icon; return <div key={module.name} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#12285a] text-[#78a0ff]"><Icon className="size-5" /></div><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-100">{module.name}</p><p className="mt-1 truncate text-xs text-slate-500">{module.detail}</p></div><span className="ml-auto text-[9px] uppercase tracking-wider text-slate-500">Planned</span></div> })}</div></div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7da5ff]">Recent activity</p><h3 className="mt-2 text-lg font-semibold text-white">Operations log</h3></div><Activity className="size-4 text-slate-500" /></div><div className="mt-5 rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-400">No activity recorded. Persistent audit logging is not configured.</div></div>
            </section>
            </>}
          </div>
        </div>
      </div>
    </main>
  )
}
