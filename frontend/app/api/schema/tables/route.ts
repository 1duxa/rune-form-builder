import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET() {
    try {
        const res = await fetch(`${baseUrl}/api/schema/tables`)
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
    }
}
