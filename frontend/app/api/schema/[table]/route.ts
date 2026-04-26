import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET(_: Request, context: { params: Promise<{ table: string }> }) {
    const { table } = await context.params
    const res = await fetch(`${baseUrl}/api/schema/${table}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}
