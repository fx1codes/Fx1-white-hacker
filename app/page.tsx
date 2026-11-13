import { Suspense } from "react"
import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { Workstation } from "@/components/workstation"

async function ProtectedWorkstation() {
  if (!(await isAdminAuthenticated())) redirect("/admin-login")
  return <Workstation />
}

export default function Home() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050b1c]" aria-label="Loading secure workspace" />}>
      <ProtectedWorkstation />
    </Suspense>
  )
}
