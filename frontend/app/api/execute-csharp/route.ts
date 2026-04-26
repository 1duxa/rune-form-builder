import { NextResponse } from "next/server"

// Proxy to backend Roslyn execution service
export async function POST(request: Request) {
  try {
    const { code, methodName, args } = await request.json()
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"
    const res = await fetch(`${baseUrl}/api/roslyn/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName, args }),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, output: "", errors: [error.message], warnings: [] },
      { status: 500 },
    )
  }
}
