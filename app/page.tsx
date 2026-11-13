import { redirect } from "next/navigation"
import { connection } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { Workstation } from "@/components/workstation"


export default async function Home() {
  await connection()
  if (!(await isAdminAuthenticated())) redirect("/admin-login")
  return <Workstation />
}
