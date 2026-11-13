import { EmailValidationError, investigateEmailAddress } from "../../../lib/email-intelligence.ts"
import { isAdminRequestAuthenticated } from "../../../lib/admin-session.ts"

const responseHeaders = { "Cache-Control": "no-store" }

export async function handleEmailIntelligenceRequest(request: Request, investigator = investigateEmailAddress, authorize = isAdminRequestAuthenticated) {
  if (!(await authorize(request))) {
    return Response.json({ error: "Administrator authentication required." }, { status: 401, headers: responseHeaders })
  }
  if (Number(request.headers.get("content-length") ?? 0) > 1_024) {
    return Response.json({ error: "Request body is too large." }, { status: 413, headers: responseHeaders })
  }

  let body: unknown
  try {
    const requestBody = await request.text()
    if (requestBody.length > 1_024) {
      return Response.json({ error: "Request body is too large." }, { status: 413, headers: responseHeaders })
    }
    body = JSON.parse(requestBody)
  } catch {
    return Response.json({ error: "Provide a valid JSON request." }, { status: 400, headers: responseHeaders })
  }

  const email = typeof body === "object" && body !== null && "email" in body ? body.email : undefined
  try {
    const investigation = await investigator(email)
    return Response.json(investigation, { headers: responseHeaders })
  } catch (error) {
    if (error instanceof EmailValidationError) {
      return Response.json({ error: error.message }, { status: 400, headers: responseHeaders })
    }
    return Response.json({ error: "Email intelligence is temporarily unavailable." }, { status: 503, headers: responseHeaders })
  }
}

export async function POST(request: Request) {
  return handleEmailIntelligenceRequest(request)
}
