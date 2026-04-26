"use client"
"use client"

import { logger } from "@/lib/logger"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormRenderer } from "@/components/form-renderer"
import type { FormSchema, RowData } from "@/types/form-builder"
import { X } from "lucide-react"

interface WeatherRow {
    id: number
    city: string
    date: string
    temperatureC: number
    summary?: string
}

export default function WeatherListPage() {
    const [rows, setRows] = useState<WeatherRow[]>([])
    const [editingRow, setEditingRow] = useState<WeatherRow | null>(null)
    const [formSchema, setFormSchema] = useState<FormSchema | null>(null)
    const [formDbId, setFormDbId] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        fetch("/api/weather").then(async (r) => setRows(await r.json()))
    }, [])

    const openEditDialog = async (row: WeatherRow) => {
        setEditingRow(row)

        // Load form schema if not already loaded
        if (!formSchema) {
            try {
                const formRes = await fetch("/api/forms/by-table/weather")
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
                            if (Array.isArray(parsed)) {
                                gridMetadataElements = parsed
                            } else {
                                gridMetadataObj = parsed
                                gridMetadataElements = parsed.elements || []
                            }
                        } catch (e) {
                            logger.error("Failed to parse grid metadata", "Weather", e)
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
            } catch (e) {
                logger.error("Failed to load form", "Weather", e)
            }
        }

        setDialogOpen(true)
    }

    const handleSubmit = async (data: RowData) => {
        if (!editingRow) return

        const body = {
            id: editingRow.id,
            city: String(data.city || data.City || ""),
            date: new Date(String(data.date || data.Date || new Date().toISOString().substring(0, 10))).toISOString(),
            temperatureC: Number(data.temperatureC || data.TemperatureC || 0),
            summary: String(data.summary || data.Summary || ""),
        }
        const res = await fetch(`/api/weather/${editingRow.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (res.ok) {
            // Refresh the list
            const updated = await (await fetch("/api/weather")).json()
            setRows(updated)
            setDialogOpen(false)
            setEditingRow(null)
        }
    }

    const getInitialData = (): RowData => {
        if (!editingRow) return {}
        // Use only the field names that match the DB schema (PascalCase)
        return {
            Id: editingRow.id,
            City: editingRow.city,
            Date: editingRow.date?.substring(0, 10),
            TemperatureC: editingRow.temperatureC,
            Summary: editingRow.summary,
        }
    }

    return (
        <div className="p-6 min-h-screen bg-slate-900">
            <h1 className="text-xl font-bold mb-6 text-slate-100">Weather Data</h1>
            <div className="space-y-2">
                {rows.map((w) => (
                    <Card
                        key={w.id}
                        className="p-4 cursor-pointer hover:bg-slate-700 transition-colors bg-slate-800 border-slate-700"
                        onDoubleClick={() => openEditDialog(w)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-semibold text-slate-100">{w.city}</div>
                                <div className="text-sm text-slate-400">{new Date(w.date).toLocaleDateString()} • {w.summary}</div>
                            </div>
                            <div className="text-lg font-medium text-blue-400">{w.temperatureC}°C</div>
                        </div>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-slate-800 border-slate-700">
                    <DialogHeader className="p-4 pb-2 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-slate-100">Edit Weather Row #{editingRow?.id}</DialogTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-slate-700 text-slate-400"
                                onClick={() => setDialogOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="p-4">
                        {formSchema && editingRow && (
                            <FormRenderer
                                schema={formSchema}
                                formId={formDbId || undefined}
                                initialData={getInitialData()}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
