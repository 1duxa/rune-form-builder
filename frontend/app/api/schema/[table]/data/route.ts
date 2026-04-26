import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET(request: Request, context: { params: Promise<{ table: string }> }) {
    const { table } = await context.params
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page") || "1"
    const pageSize = searchParams.get("pageSize") || "50"

    try {
        const res = await fetch(`${baseUrl}/api/schema/${table}/data?page=${page}&pageSize=${pageSize}`)
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }
}
