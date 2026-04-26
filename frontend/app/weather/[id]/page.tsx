"use client"
"use client"

import { logger } from "@/lib/logger"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FormRenderer } from "@/components/form-renderer"
import type { FormSchema, RowData } from "@/types/form-builder"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function WeatherEditPage() {
    const params = useParams()
    const id = params?.id as string
    const [formSchema, setFormSchema] = useState<FormSchema>({ id: "weather-form", name: "Weather Form", elements: [], formWidth: 12, formHeight: 12 })
    const [initialData, setInitialData] = useState<RowData>({})
    const [loading, setLoading] = useState(true)
    const [formDbId, setFormDbId] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const load = async () => {
            try {
                const [rowRes, formRes] = await Promise.all([
                    fetch(`/api/weather/${id}`),
                    fetch(`/api/forms/by-table/weather`),
                ])
                const row = await rowRes.json()
                const form = await formRes.json()
                setFormDbId(form.id)

                // Parse grid metadata from logicCode if present
                let gridMetadataObj: { formWidth?: number; formHeight?: number; elements?: any[] } = {}
                let gridMetadataElements: any[] = []
                const logicCode = form.logicCode || ""
                if (logicCode.startsWith("// Grid Layout:")) {
                    const match = logicCode.match(/\/\/ Grid Layout: ([\s\S]*?)\n/)
                    if (match) {
                        try {
                            const parsed = JSON.parse(match[1])
                            // Support both old format (array) and new format (object with elements)
                            if (Array.isArray(parsed)) {
                                gridMetadataElements = parsed
                            } else {
                                gridMetadataObj = parsed
                                gridMetadataElements = parsed.elements || []
                            }
                        } catch (e) {
                            logger.error("Failed to parse grid metadata", "WeatherDetail", e)
                        }
                    }
                }

                // Map form fields with their saved grid positions
                const fieldElements = (form.fields || []).map((f: any, index: number) => {
                    const meta = gridMetadataElements.find((m: any) => m.name === f.name) || {}
                    return {
                        id: f.id,
                        name: f.name,
                        label: f.label,
                        type: f.type,
                        required: f.required,
                        gridX: meta.gridX ?? 0,
                        gridY: meta.gridY ?? index,
                        gridWidth: meta.gridWidth ?? 6,
                        gridHeight: meta.gridHeight ?? 1,
                    }
                })

                // Restore HTML elements (headings, labels, paragraphs) from grid metadata
                const htmlElements = gridMetadataElements
                    .filter((m: any) => ["heading", "label", "paragraph"].includes(m.type))
                    .map((m: any) => ({
                        id: m.id || crypto.randomUUID(),
                        name: m.name,
                        type: m.type,
                        content: m.content || "",
                        headingLevel: m.headingLevel,
                        fontSize: m.fontSize,
                        fontWeight: m.fontWeight,
                        color: m.color,
                        gridX: m.gridX ?? 0,
                        gridY: m.gridY ?? 0,
                        gridWidth: m.gridWidth ?? 6,
                        gridHeight: m.gridHeight ?? 1,
                    }))

                const elements = [...fieldElements, ...htmlElements]
                const restoredWidth = gridMetadataObj.formWidth ?? 12
                const maxY = Math.max(...elements.map(e => e.gridY + e.gridHeight), 0)
                const restoredHeight = gridMetadataObj.formHeight ?? Math.max(12, maxY + 2)
                setFormSchema({ id: form.id, name: form.name, elements, formWidth: restoredWidth, formHeight: restoredHeight })
                // Use PascalCase to match DB schema and form field names
                setInitialData({
                    Id: row.id,
                    City: row.city,
                    Date: row.date?.substring(0, 10),
                    TemperatureC: row.temperatureC,
                    Summary: row.summary,
                })
            } finally {
                setLoading(false)
            }
        }
        if (id) load()
    }, [id])

    const handleSubmit = async (data: RowData) => {
        const body = {
            id: Number(id),
            city: String(data.city || ""),
            date: new Date(String(data.date || new Date().toISOString().substring(0, 10))).toISOString(),
            temperatureC: Number(data.temperatureC || 0),
            summary: String(data.summary || ""),
        }
        const res = await fetch(`/api/weather/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (res.ok) router.push("/weather")
    }

    if (loading) return <Card className="p-4">Loading...</Card>

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Edit Weather Row #{id}</h1>
                <Button variant="outline" onClick={() => router.push("/weather")}>Back</Button>
            </div>
            <FormRenderer schema={formSchema} formId={formDbId || undefined} initialData={initialData} onSubmit={handleSubmit} />
        </div>
    )
}
