"use client"

import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  FileText,
  Fingerprint,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Network,
  Play,
  Radio,
  Search,
  ScanSearch,
  ScrollText,
  Server,
  Settings2,
  Shield,
  Smartphone,
  TerminalSquare,
  Wifi,
  X,
} from "lucide-react"

const logoUrl = "https://cdn.builder.io/api/v1/image/assets%2Fa7d10ba2a7f54019b832d6402a7b5531%2Fc6f091693f4140e8ac258419f8dee122?format=webp&width=800&height=1200"

const modules = [
  { name: "Network Analysis", detail: "Inventory, paths, exposure", icon: Network, tone: "cyan" },
  { name: "Web & API Security", detail: "Endpoint and control checks", icon: Globe2, tone: "blue" },
  { name: "Password Auditing", detail: "Hash and policy review", icon: LockKeyhole, tone: "violet" },
  { name: "Wireless Security", detail: "Authorized radio assessment", icon: Wifi, tone: "amber" },
  { name: "Android Security", detail: "APK and runtime review", icon: Smartphone, tone: "green" },
  { name: "Digital Forensics", detail: "Evidence triage and timeline", icon: Fingerprint, tone: "rose" },
]

const navItems = [
  { label: "Command Center", icon: LayoutDashboard },
  { label: "Security Modules", icon: ScanSearch },
  { label: "Findings & Evidence", icon: Shield },
  { label: "Reports", icon: FileText },
  { label: "AI Analyst", icon: Bot },
]

export function Workstation() {
  const [activeNav, setActiveNav] = useState("Command Center")
  const [isRunning, setIsRunning] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function startScan() {
    setIsRunning(true)
    window.setTimeout(() => setIsRunning(false), 2200)
  }

  return (
    <main className="min-h-screen bg-[#050b1c] text-slate-100">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#07132e] px-5 py-5 transition-transform lg:static lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-xl border border-[#0504AA]/70 bg-[#0504AA] shadow-[0_0_24px_rgba(5,4,170,0.55)]">
                <img src={logoUrl} alt="FX1 White Hacker logo" className="h-full w-full object-cover object-top" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.22em] text-white">FX1</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">White Hacker</p>
              </div>
            </div>
            <button aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"><X /></button>
          </div>

          <div className="mt-10 rounded-2xl border border-[#243b76] bg-[#0b1d43] p-4">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#7da5ff]"><CircleDot className="size-3 fill-current" /> Core Engine Online</div>
            <p className="mt-3 text-xs leading-5 text-slate-400">Independent Python FX1 Core Engine is ready for authorized workloads.</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-500"><span>v0.1.0-alpha</span><span className="text-emerald-400">Healthy</span></div>
          </div>

          <nav className="mt-8 flex-1" aria-label="Primary navigation">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeNav === item.label
                return <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileNavOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${active ? "bg-[#0504AA] text-white shadow-[0_8px_24px_rgba(5,4,170,0.28)]" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}><Icon className="size-4" />{item.label}{active && <ChevronRight className="ml-auto size-4" />}</button>
              })}
            </div>
            <p className="mb-3 mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">System</p>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-slate-200"><Settings2 className="size-4" />Workspace Settings</button>
          </nav>

          <div className="border-t border-white/10 pt-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">FX</div><div className="min-w-0"><p className="truncate text-xs font-medium text-white">Authorized Operator</p><p className="truncate text-[11px] text-slate-500">Local workspace</p></div><button aria-label="Operator settings" className="ml-auto text-slate-500 hover:text-white"><ArrowUpRight className="size-4" /></button></div></div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#07132e]/85 px-5 backdrop-blur-xl lg:px-9">
            <div className="flex items-center gap-3"><button aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"><Menu /></button><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7da5ff]">Security Operations</p><h1 className="mt-1 text-xl font-semibold tracking-tight text-white">{activeNav}</h1></div></div>
            <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 sm:flex"><Search className="size-3.5" /> Search workspace <kbd className="ml-3 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd></div><button aria-label="Open notifications" className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/10"><AlertTriangle className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-400" /></button></div>
          </header>

          <div className="mx-auto max-w-[1600px] p-5 lg:p-9">
            <section className="relative overflow-hidden rounded-3xl border border-[#243b76] bg-[radial-gradient(circle_at_top_right,rgba(5,4,170,0.45),transparent_36%),linear-gradient(115deg,#0b1e49,#081432)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] lg:p-8">
              <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-[#3156b4]/30" /><div className="pointer-events-none absolute -right-5 -top-12 size-52 rounded-full border border-[#3156b4]/25" />
              <div className="relative max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#4e70ce]/40 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#b5c8ff]"><Activity className="size-3.5" /> Mission control</div><h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">Defend the surface.<br /><span className="text-[#7da5ff]">Know the system.</span></h2><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Run controlled security assessments from one observable command center. Every operation stays scoped, logged, and tied to an authorization boundary.</p><div className="mt-7 flex flex-wrap gap-3"><button onClick={startScan} disabled={isRunning} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0504AA] shadow-lg transition hover:bg-[#e7ebff] disabled:cursor-wait disabled:opacity-70"><Play className="size-4 fill-current" />{isRunning ? "Preparing assessment…" : "Start assessment"}</button><button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"><TerminalSquare className="size-4" /> Open console</button></div></div>
            </section>

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[{ label: "Assets monitored", value: "24", change: "+3 this week", icon: Server }, { label: "Open findings", value: "07", change: "2 high priority", icon: Shield }, { label: "Jobs this month", value: "138", change: "+18.4% vs last", icon: Radio }, { label: "Coverage score", value: "92%", change: "Above target", icon: CheckCircle2 }].map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="rounded-2xl border border-white/10 bg-[#0a1630] p-5"><div className="flex items-center justify-between"><p className="text-xs text-slate-400">{stat.label}</p><Icon className="size-4 text-[#6e91f5]" /></div><p className="mt-4 text-3xl font-semibold tracking-tight text-white">{stat.value}</p><p className="mt-2 text-xs text-emerald-400">{stat.change}</p></article> })}
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7da5ff]">Capability matrix</p><h3 className="mt-2 text-lg font-semibold text-white">Security modules</h3></div><button className="text-xs font-medium text-[#8da9ff] hover:text-white">View all <ArrowUpRight className="ml-1 inline size-3.5" /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{modules.map((module) => { const Icon = module.icon; return <button key={module.name} className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-left transition hover:border-[#3658b0] hover:bg-[#0f2552]"><div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#12285a] text-[#78a0ff]`}><Icon className="size-5" /></div><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-100">{module.name}</p><p className="mt-1 truncate text-xs text-slate-500">{module.detail}</p></div><ChevronRight className="ml-auto size-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-[#91adff]" /></button> })}</div></div>

              <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#7da5ff]">Recent activity</p><h3 className="mt-2 text-lg font-semibold text-white">Operations log</h3></div><ScrollText className="size-4 text-slate-500" /></div><div className="mt-5 flex flex-col gap-4">{[{ title: "API surface inventory", meta: "Completed · 8 min ago", tone: "text-emerald-400" }, { title: "Evidence bundle exported", meta: "Report #FX-1042 · 42 min ago", tone: "text-[#7da5ff]" }, { title: "New high finding triaged", meta: "auth-gateway · 1 hr ago", tone: "text-amber-400" }, { title: "Android APK queued", meta: "mobile-client-v3 · 2 hrs ago", tone: "text-slate-400" }].map((item) => <div key={item.title} className="flex items-start gap-3"><div className={`mt-1 size-2 rounded-full bg-current ${item.tone}`} /><div><p className="text-sm text-slate-200">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.meta}</p></div></div>)}</div><button className="mt-6 w-full rounded-xl border border-white/10 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">Open audit trail</button></div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
