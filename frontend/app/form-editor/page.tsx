"use client"
"use client"

import { logger } from "@/lib/logger"

import { useEffect, useState } from "react"
import type { FormSchema } from "@/types/form-builder"
import type { CSharpDependency } from "@/types/csharp"
import { GridFormBuilder } from "@/components/grid-form-builder"
import { CSharpIDE } from "@/components/csharp-ide"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CSharpTemplateGenerator } from "@/lib/csharp-template-generator"

interface FormRow {
    id: string
    name: string
    description?: string
    targetTable?: string
}

export default function FormEditorPage() {
    const [forms, setForms] = useState<FormRow[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editingFormId, setEditingFormId] = useState<string | null>(null)
    const [schema, setSchema] = useState<FormSchema>({
        id: "weather-form",
        name: "Weather Form",
        elements: [],
        formWidth: 36,
        formHeight: 30,
    })
    const [logicCode, setLogicCode] = useState<string>("")

    useEffect(() => {
        fetch("/api/forms").then(async (r) => {
            const data = await r.json()
            setForms(data || [])
            setLoading(false)
        })
    }, [])

    const handleExecuteCode = async (code: string) => {
        try {
            const response = await fetch("/api/execute-csharp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, methodName: "Main", args: [] }),
            })
            const result = await response.json()
            return result
        } catch (error: any) {
            return {
                success: false,
                output: "",
                errors: [error.message],
                warnings: []
            }
        }
    }

    const startEditingWeather = async () => {
        setEditing(true)
        setEditingFormId(null)
        // Load weather columns and pre-map as elements
        const res = await fetch("/api/schema/weather")
        const data = await res.json()
        const cols = (data.columns || []) as Array<{ name: string; clrType: string; nullable: boolean }>
        const elements = cols.map((c, i) => ({
            id: crypto.randomUUID(),
            name: c.name,
            label: c.name,
            type: mapClrTypeToElement(c.clrType) as any,
            required: !c.nullable,
            gridX: 0,
            gridY: i * 3,
            gridWidth: 18,
            gridHeight: 3,
        }))
        const mapped = { id: "weather-form", name: "Weather Form", elements, formWidth: 36, formHeight: Math.max(30, elements.length * 3 + 6) }
        setSchema(mapped)
        const tpl = new CSharpTemplateGenerator().generateFormLogicClass(mapped)
        setLogicCode(tpl)
    }

    const startEditingExisting = async (formId: string) => {
        setEditing(true)
        setEditingFormId(formId)
        const res = await fetch(`/api/forms/${formId}`)
        const form = await res.json()

        // Try to extract grid positions from logicCode metadata
        let gridMetadataObj: { formWidth?: number; formHeight?: number; elements?: any[] } = {}
        let gridMetadataElements: any[] = []
        let cleanLogicCode = form.logicCode || ""
        if (cleanLogicCode.startsWith("// Grid Layout:")) {
            const match = cleanLogicCode.match(/\/\/ Grid Layout: ([\s\S]*?)\n/)
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
                    cleanLogicCode = cleanLogicCode.substring(match[0].length)
                } catch (e) {
                    logger.error("Failed to parse grid metadata", "FormEditor", e)
                }
            }
        }

        // First, map DB fields with their grid positions
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
        const restoredHeight = gridMetadataObj.formHeight ?? Math.max(12, elements.length + 2)
        setSchema({ id: form.id, name: form.name, elements, formWidth: restoredWidth, formHeight: restoredHeight })
        setLogicCode(cleanLogicCode)
    }

    const saveForm = async () => {
        const fields = schema.elements
            .filter((el) => !["heading", "label", "paragraph"].includes(el.type))
            .map((el, index) => ({
                // Server generates `id` and assigns `formId` via relationship
                name: el.name,
                label: el.label ?? el.name,
                type: el.type,
                required: !!el.required,
                order: index + 1,
                // Store grid position as metadata in label for now
                // (FormField model doesn't have grid position yet)
            }))

        // Store full schema with grid positions in LogicCode comment
        // Include all element properties for HTML elements so they can be restored
        // Also store form dimensions
        const gridMetadata = JSON.stringify({
            formWidth: schema.formWidth,
            formHeight: schema.formHeight,
            elements: schema.elements.map(el => ({
                id: el.id,
                name: el.name,
                type: el.type,
                gridX: el.gridX,
                gridY: el.gridY,
                gridWidth: el.gridWidth,
                gridHeight: el.gridHeight,
                // HTML element specific properties
                ...(el.content !== undefined && { content: el.content }),
                ...(el.headingLevel !== undefined && { headingLevel: el.headingLevel }),
                ...(el.fontSize !== undefined && { fontSize: el.fontSize }),
                ...(el.fontWeight !== undefined && { fontWeight: el.fontWeight }),
                ...(el.color !== undefined && { color: el.color }),
            }))
        })

        const codeWithMetadata = `// Grid Layout: ${gridMetadata}\n${logicCode}`

        const body = {
            name: schema.name,
            description: "Form for weather table",
            targetTable: "weather",
            logicCode: codeWithMetadata,
            fields,
            hooks: [],
        }

        const url = editingFormId ? `/api/forms/${editingFormId}` : "/api/forms"
        const method = editingFormId ? "PUT" : "POST"

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
        if (!res.ok) {
            const err = await res.text()
            alert(`Failed to save form: ${err}`)
            return
        }
        alert("Form saved")
        setEditing(false)
        setEditingFormId(null)
        const updated = await (await fetch("/api/forms")).json()
        setForms(updated || [])
    }

    if (loading) return <Card className="p-4 bg-slate-800 border-slate-700 text-slate-200">Loading...</Card>

    return (
        <div className="min-h-screen bg-slate-900 p-6 space-y-6">
            {!editing && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-100">Forms</h1>
                        <div className="flex gap-2">
                            <Button onClick={startEditingWeather} className="bg-blue-600 hover:bg-blue-700">Add Form (Weather)</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {forms.map((f) => (
                            <Card key={f.id} className="p-4 bg-slate-800 border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-slate-100">{f.name}</div>
                                        <div className="text-sm text-slate-400">{f.targetTable || "(no table)"}</div>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-slate-600 text-black hover:bg-slate-700" onClick={() => startEditingExisting(f.id)}>Edit</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {editing && (
                <div className="space-y-4 w-full">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-slate-100">{editingFormId ? 'Edit Form' : 'New Weather Form'}</h1>
                        <div className="flex gap-2">
                            <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-700" onClick={() => { setEditing(false); setEditingFormId(null); }}>Cancel</Button>
                            <Button onClick={saveForm} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <div className="w-full">
                            <GridFormBuilder schema={schema} onSchemaChange={setSchema} targetTable="weather" />
                        </div>
                        <div className="w-full border border-slate-700 rounded-md bg-slate-800" style={{ height: '600px' }}>
                            <CSharpIDE schema={schema} initialCode={logicCode} onCodeChange={setLogicCode} onExecute={handleExecuteCode} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function mapClrTypeToElement(clr: string): string {
    switch (clr) {
        case "Int32":
        case "Int64":
        case "Double":
        case "Decimal":
            return "number"
        case "DateTime":
            return "date"
        case "Boolean":
            return "checkbox"
        default:
            return "text"
    }
}
