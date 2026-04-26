import { NextResponse } from "next/server"

// Proxy submit to backend which runs hooks and saves data
export async function POST(request: Request) {
  try {
    const { formId, data } = await request.json()
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"
    const res = await fetch(`${baseUrl}/api/forms/${formId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    })
    const json = await res.json()
    return NextResponse.json(json, { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, result: { success: false, message: error.message }, errors: [error.message] },
      { status: 500 },
    )
  }
}
