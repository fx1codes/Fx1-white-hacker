const HOST_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))+$/i

export function normalizePublicHostname(value: string): string | null {
  const hostname = value.trim().toLowerCase().replace(/\.$/, "")
  if (!HOST_PATTERN.test(hostname)) return null
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return null
  return hostname
}
