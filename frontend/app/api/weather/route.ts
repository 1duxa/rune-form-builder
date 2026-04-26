import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET() {
    const res = await fetch(`${baseUrl}/api/weather`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}

export async function POST(request: Request) {
    const body = await request.json()
    const res = await fetch(`${baseUrl}/api/weather`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}
