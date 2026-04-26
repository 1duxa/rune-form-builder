import { NextResponse } from "next/server"

// Proxy init hook to backend - triggers OnFormInit
export async function POST(request: Request) {
    try {
        const { formId, initialData } = await request.json()
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"
        const res = await fetch(`${baseUrl}/api/hooks/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formIdString: formId, initialData }),
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, debugMessages: [], errors: [error.message] },
            { status: 500 },
        )
    }
}
