"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { ClipboardCheck, Plus, ShieldCheck, Trash2, CircleAlert, History, LockKeyhole } from "lucide-react"
import { normalizePublicHostname } from "@/lib/assessment-scope"

type Asset = {
  id: string
  hostname: string
  purpose: string
  addedAt: string
}

type AuditEntry = {
  id: string
  action: string
  detail: string
  at: string
}

const ASSETS_KEY = "fx1.stage5.assets.v1"
const AUDIT_KEY = "fx1.stage5.audit.v1"

function readList<T>(key: string): T[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]")
    return Array.isArray(value) ? value as T[] : []
  } catch {
    return []
  }
}

export function AssessmentWorkspace() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [hostname, setHostname] = useState("")
  const [purpose, setPurpose] = useState("")
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState("")
  const [planCreated, setPlanCreated] = useState(false)

  useEffect(() => {
    setAssets(readList<Asset>(ASSETS_KEY))
    setAudit(readList<AuditEntry>(AUDIT_KEY))
  }, [])

  const saveAudit = (entry: AuditEntry) => {
    setAudit((current) => {
      const next = [entry, ...current].slice(0, 50)
      window.localStorage.setItem(AUDIT_KEY, JSON.stringify(next))
      return next
    })
  }

  const summary = useMemo(() => ({
    assets: assets.length,
    recentEvents: audit.length,
  }), [assets.length, audit.length])

  function addAsset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const normalized = normalizePublicHostname(hostname)
    if (!normalized) {
      setError("Enter a valid public DNS hostname, such as example.com. IP addresses and wildcard scopes are not accepted in this initial stage.")
      return
    }
    if (!authorized) {
      setError("Confirm that you own this asset or have explicit written authorization to assess it.")
      return
    }
    if (assets.some((asset) => asset.hostname === normalized)) {
      setError("This hostname is already in your asset inventory.")
      return
    }

    const asset: Asset = {
      id: crypto.randomUUID(),
      hostname: normalized,
      purpose: purpose.trim().slice(0, 120),
      addedAt: new Date().toISOString(),
    }
    const next = [asset, ...assets]
    setAssets(next)
    window.localStorage.setItem(ASSETS_KEY, JSON.stringify(next))
    saveAudit({ id: crypto.randomUUID(), action: "Asset registered", detail: normalized, at: new Date().toISOString() })
    setHostname("")
    setPurpose("")
    setAuthorized(false)
    setPlanCreated(false)
  }

  function removeAsset(asset: Asset) {
    const next = assets.filter((item) => item.id !== asset.id)
    setAssets(next)
    window.localStorage.setItem(ASSETS_KEY, JSON.stringify(next))
    saveAudit({ id: crypto.randomUUID(), action: "Asset removed", detail: asset.hostname, at: new Date().toISOString() })
    setPlanCreated(false)
  }

  function createPlan() {
    if (assets.length === 0) return
    setPlanCreated(true)
    saveAudit({
      id: crypto.randomUUID(),
      action: "Assessment plan prepared",
      detail: `${assets.length} explicitly authorized asset(s); execution not started`,
      at: new Date().toISOString(),
    })
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[#243b76] bg-[radial-gradient(circle_at_top_right,rgba(5,4,170,0.35),transparent_38%),linear-gradient(115deg,#0b1e49,#081432)] p-6 lg:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#4e70ce]/40 bg-white/5 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#b5c8ff]"><ShieldCheck className="size-3.5" /> Stage 5 · Scope control</div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Assessment workspace</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Register assets you own or are explicitly authorized to assess, record the authorization declaration, and prepare a review plan. This stage does not send probes, scan hosts, or execute vulnerability checks.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-slate-400">Registered assets</p><p className="mt-2 text-2xl font-semibold text-white">{summary.assets}</p></div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-xs text-slate-400">Local audit events</p><p className="mt-2 text-2xl font-semibold text-white">{summary.recentEvents}</p></div>
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4"><p className="text-xs text-amber-200">Execution status</p><p className="mt-2 text-lg font-semibold text-white">Not enabled</p></div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6">
          <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#12285a] text-[#8eaeff]"><Plus className="size-5" /></div><div><h3 className="font-semibold text-white">Register an authorized asset</h3><p className="mt-1 text-xs text-slate-400">Public DNS hostnames only in this release</p></div></div>
          <form onSubmit={addAsset} className="mt-5 space-y-4">
            <label className="block text-xs font-medium text-slate-300">Hostname
              <input required maxLength={253} value={hostname} onChange={(event) => setHostname(event.target.value)} placeholder="example.com" className="mt-2 w-full rounded-xl border border-white/15 bg-[#050b1c] px-4 py-3 text-sm text-white outline-none focus:border-[#7da5ff]" />
            </label>
            <label className="block text-xs font-medium text-slate-300">Asset purpose / owner notes
              <input maxLength={120} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Company website — owned by my team" className="mt-2 w-full rounded-xl border border-white/15 bg-[#050b1c] px-4 py-3 text-sm text-white outline-none focus:border-[#7da5ff]" />
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-slate-300">
              <input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} className="mt-0.5 size-4 accent-[#7da5ff]" />
              <span>I confirm I own this asset or have explicit permission from its owner to assess it. I understand this declaration is recorded locally and does not independently verify authorization.</span>
            </label>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0504AA] hover:bg-[#e7ebff]"><Plus className="size-4" /> Add to scope</button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6">
          <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-[#12285a] text-[#8eaeff]"><ClipboardCheck className="size-5" /></div><div><h3 className="font-semibold text-white">Assessment plan</h3><p className="mt-1 text-xs text-slate-400">Preparation only — no target traffic</p></div></div>
          <ol className="mt-5 space-y-3 text-sm text-slate-300">
            <li className="flex gap-3"><span className="text-[#8eaeff]">01</span> Confirm ownership and written authorization</li>
            <li className="flex gap-3"><span className="text-[#8eaeff]">02</span> Review registered hostnames and boundaries</li>
            <li className="flex gap-3"><span className="text-[#8eaeff]">03</span> Select passive checks and safe rate limits</li>
            <li className="flex gap-3"><span className="text-[#8eaeff]">04</span> Approve execution and evidence retention policy</li>
          </ol>
          <button type="button" disabled={assets.length === 0} onClick={createPlan} className="mt-6 w-full rounded-xl border border-[#5478d5]/50 bg-[#12285a] px-4 py-3 text-sm font-semibold text-[#c7d7ff] disabled:cursor-not-allowed disabled:opacity-40">Prepare review plan</button>
          {planCreated && <p role="status" className="mt-3 text-xs text-emerald-300">Review plan prepared and added to this browser's audit log. No assessment was executed.</p>}
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 size-3.5 shrink-0" /> Inventory and audit entries are stored in this browser only. They are not synchronized to Vercel or other devices.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6">
        <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-white">Authorized asset inventory</h3><p className="mt-1 text-xs text-slate-400">Only hostnames you have permission to assess</p></div><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-slate-400">{assets.length} assets</span></div>
        {assets.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">No assets registered yet.</div> : <div className="mt-5 space-y-2">{assets.map((asset) => <article key={asset.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="min-w-0"><p className="break-all text-sm font-medium text-white">{asset.hostname}</p><p className="mt-1 text-xs text-slate-500">{asset.purpose || "No owner notes"} · Added {new Date(asset.addedAt).toLocaleDateString()}</p></div><button type="button" onClick={() => removeAsset(asset)} aria-label={`Remove ${asset.hostname}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-4" /></button></article>)}</div>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0a1630] p-5 lg:p-6">
        <div className="flex items-center gap-3"><History className="size-4 text-[#8eaeff]" /><h3 className="font-semibold text-white">Local audit trail</h3></div>
        {audit.length === 0 ? <p className="mt-4 text-sm text-slate-500">No scope events recorded in this browser.</p> : <div className="mt-4 space-y-3">{audit.map((entry) => <div key={entry.id} className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-3 last:border-0"><div><p className="text-xs font-medium text-slate-200">{entry.action}</p><p className="mt-1 break-all text-xs text-slate-500">{entry.detail}</p></div><time className="text-[10px] text-slate-500">{new Date(entry.at).toLocaleString()}</time></div>)}</div>}
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-amber-200/80"><CircleAlert className="mt-0.5 size-4 shrink-0" /> Browser-local storage can be cleared by the user and is not a tamper-resistant audit system. Central persistence, server-side authorization records, and assessment execution require a later backend integration.</p>
    </section>
  )
}
