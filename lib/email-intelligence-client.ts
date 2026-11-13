import type { EmailInvestigation } from "./email-intelligence"

function isEmailInvestigation(value: unknown): value is EmailInvestigation {
  if (typeof value !== "object" || value === null) return false
  const result = value as Partial<EmailInvestigation>
  return (
    typeof result.email === "string" &&
    typeof result.domain === "string" &&
    typeof result.investigatedAt === "string" &&
    Array.isArray(result.checks) &&
    result.checks.every((check) =>
      typeof check === "object" &&
      check !== null &&
      typeof check.name === "string" &&
      typeof check.status === "string" &&
      typeof check.confidence === "string" &&
      Array.isArray(check.details) &&
      check.details.every((detail) => typeof detail === "string") &&
      typeof check.source === "string"
    )
  )
}

export async function requestEmailInvestigation(
  email: string,
  fetcher: typeof fetch = fetch,
): Promise<EmailInvestigation> {
  let response: Response
  try {
    response = await fetcher("/api/email-intelligence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    })
  } catch {
    throw new Error("The investigation service could not be reached.")
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error("The investigation returned an invalid response.")
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "The investigation could not be completed."
    throw new Error(message)
  }

  if (!isEmailInvestigation(payload)) {
    throw new Error("The investigation returned an invalid response.")
  }

  return payload
}
