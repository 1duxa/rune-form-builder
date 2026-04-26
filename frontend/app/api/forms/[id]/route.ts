import { NextResponse } from "next/server"

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const res = await fetch(`${baseUrl}/api/forms/${id}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const body = await request.json()
    const res = await fetch(`${baseUrl}/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params
    const res = await fetch(`${baseUrl}/api/forms/${id}`, { method: "DELETE" })
    return NextResponse.json({}, { status: res.status })
}
