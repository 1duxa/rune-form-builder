import { NextResponse } from "next/server"

// Proxy onchange hook to backend
export async function POST(request: Request) {
  try {
    const { formId, fieldId, methodName, value } = await request.json()
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"
    const res = await fetch(`${baseUrl}/api/hooks/onchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formIdString: formId, fieldId, methodName, value }),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, result: "", errors: [error.message] },
      { status: 500 },
    )
  }
}
