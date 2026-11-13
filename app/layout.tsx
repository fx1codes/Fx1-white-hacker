import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FX1 White Hacker | Security Operations",
  description: "Authorized security testing and defensive operations command center.",
}

export const viewport: Viewport = {
  themeColor: "#0504AA",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}<Analytics /></body></html>
}
