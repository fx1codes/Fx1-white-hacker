import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { Workstation } from "@/components/workstation"

export const dynamic = "force-dynamic"

export default async function Home() {
  if (!(await isAdminAuthenticated())) redirect("/admin-login")
  return <Workstation />
}
