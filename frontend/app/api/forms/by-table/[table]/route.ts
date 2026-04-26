import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET(_: Request, ctx: { params: Promise<{ table: string }> }) {
    const { table } = await ctx.params
    const res = await fetch(`${baseUrl}/api/forms/by-table/${table}`)
    let data: any = {}
    try {
        data = await res.json()
    } catch {
        data = {}
    }
    return NextResponse.json(data, { status: res.status })
}
