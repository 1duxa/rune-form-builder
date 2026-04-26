"use client"
"use client"

import { logger } from "@/lib/logger"

import { useEffect, useState } from "react"
import { GridFormBuilder } from "@/components/grid-form-builder"
import type { FormSchema } from "@/types/form-builder"
import { Button } from "@/components/ui/button"
import { CSharpIDE } from "@/components/csharp-ide"
import { CSharpTemplateGenerator } from "@/lib/csharp-template-generator"

function mapSchemaToFields(schema: FormSchema) {
    return schema.elements
        .filter((el) => !["heading", "label", "paragraph"].includes(el.type))
        .map((el, index) => ({
            id: crypto.randomUUID(),
            formId: "",
            name: el.name,
            label: el.label ?? el.name,
            type: el.type,
            required: !!el.required,
            order: index + 1,
        }))
}

export default function WeatherFormConfiguratorPage() {
    const [schema, setSchema] = useState<FormSchema>({ id: "weather-form", name: "Weather Form", elements: [], formWidth: 12, formHeight: 20 })
    const [saving, setSaving] = useState(false)
    const [logicCode, setLogicCode] = useState<string>("")

    useEffect(() => {
        const loadColumns = async () => {
            try {
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
                    gridY: i,
                    gridWidth: 6,
                    gridHeight: 1,
                }))
                setSchema({ id: "weather-form", name: "Weather Form", elements, formWidth: 12, formHeight: Math.max(12, elements.length + 2) })
                const tpl = new CSharpTemplateGenerator().generateFormLogicClass({ id: "weather-form", name: "Weather Form", elements, formWidth: 12, formHeight: 12 })
                setLogicCode(tpl)
            } catch (e) {
                logger.error("Failed to load schema for weather", "FormConfigurator", e)
            }
        }
        loadColumns()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const fields = mapSchemaToFields(schema)
            const body = {
                name: "Weather Form",
                description: "Form for weather table",
                targetTable: "weather",
                logicCode,
                fields,
                hooks: [],
            }
            const res = await fetch("/api/forms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })
            if (!res.ok) throw new Error("Failed to save form")
            alert("Form saved for table 'weather'")
        } catch (e: any) {
            alert(e.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Weather Form Configurator</h1>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Form"}</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <GridFormBuilder schema={schema} onSchemaChange={setSchema} />
                </div>
                <div className="border rounded-md">
                    <CSharpIDE initialCode={logicCode} onCodeChange={setLogicCode} />
                </div>
            </div>
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
