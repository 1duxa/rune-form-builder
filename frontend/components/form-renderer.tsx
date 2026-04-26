"use client"
"use client"

import { logger } from "@/lib/logger"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import type { FormSchema, FormElement, RowData } from "@/types/form-builder"

interface FormRendererProps {
  schema: FormSchema
  formId?: string
  initialData?: RowData
  onSubmit?: (data: RowData) => Promise<void>
  onFieldChange?: (fieldId: string, value: any) => Promise<any>
  onValidate?: (fieldId: string, value: any) => Promise<{ valid: boolean; error?: string }>
}

export function FormRenderer({ schema, formId, initialData = {}, onSubmit, onFieldChange, onValidate }: FormRendererProps) {
  const [formData, setFormData] = useState<RowData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugMessages, setDebugMessages] = useState<string[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const initRanRef = React.useRef(false)

  const logError = (context: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error)
    setGlobalError(`${context}: ${errorMessage}`)
    logger.error(errorMessage, context, error)
  }

  // Execute OnFormInit when form loads - only once
  React.useEffect(() => {
    // Only run init once per formId
    if (!formId || initRanRef.current) return
    initRanRef.current = true

    const runInit = async () => {
      try {
        const res = await fetch("/api/hooks/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId, initialData }),
        })
        if (!res.ok) {
          if (res.status !== 404) {
            logError("Init hook failed", new Error(`HTTP ${res.status}`))
          }
          return
        }
        const result = await res.json()
        if (result.success && result.debugMessages?.length > 0) {
          setDebugMessages(result.debugMessages)
          // Do not block the UI with alerts; log for dev only
          result.debugMessages.forEach((msg: string) => logger.info(msg, "InitHook"))
        }
      } catch (error) {
        logError("Init hook error", error)
      }
    }
    runInit()
  }, [formId, initialData])

  const handleFieldChange = async (element: FormElement, value: unknown) => {
    // Validate value is not undefined
    const safeValue = value === undefined ? null : value

    // Capture pre-change snapshot and old value for backend
    const prevValue = formData[element.name]
    const prevData = { ...formData }

    // Update form data locally
    const newData = { ...formData, [element.name]: safeValue }
    setFormData(newData)

    // Clear previous error for this field
    if (errors[element.id]) {
      const newErrors = { ...errors }
      delete newErrors[element.id]
      setErrors(newErrors)
    }

    // Call backend onChange hook for all fields - the backend will execute OnFieldChanged
    if (formId) {
      try {
        const res = await fetch("/api/hooks/onchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send pre-change snapshot so backend can compute OldValue correctly
          body: JSON.stringify({ formId, fieldId: element.id, fieldName: element.name, value: safeValue, oldValue: prevValue, initialData: prevData }),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.success) {
            // Show any debug messages from C# code
            if (result.debugMessages?.length > 0) {
              result.debugMessages.forEach((msg: string) => logger.info(msg, "OnChangeHook"))
            }
            // Update value if transformed
            if (result.result !== undefined && result.result !== safeValue) {
              newData[element.name] = result.result
              setFormData(newData)
            }
          }
        }
      } catch (error) {
        logError(`OnChange error for ${element.name}`, error)
      }
    }

    // Call onChange hook if configured (legacy)
    if (element.onChange && onFieldChange) {
      try {
        const transformedValue = await onFieldChange(element.id, safeValue)
        if (transformedValue !== undefined) {
          newData[element.name] = transformedValue
          setFormData(newData)
        }
      } catch (error) {
        logError(`OnChange callback error for ${element.name}`, error)
      }
    }

    // Validate with backend if formId present
    if (formId && element.required) {
      try {
        const res = await fetch("/api/hooks/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId, fieldId: element.id, value: safeValue, initialData: newData }),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.success && result.result) {
            if (!result.result.isValid) {
              setErrors({ ...errors, [element.id]: result.result.errorMessage || "Validation failed" })
            } else {
              const newErrors = { ...errors }
              delete newErrors[element.id]
              setErrors(newErrors)
            }
          }
        }
      } catch (error) {
        logError(`Validate hook error for ${element.name}`, error)
      }
    }

    // Validate if configured (legacy)
    if (element.validation && onValidate) {
      try {
        const result = await onValidate(element.id, safeValue)
        if (!result.valid) {
          setErrors({ ...errors, [element.id]: result.error || "Validation failed" })
        } else {
          const newErrors = { ...errors }
          delete newErrors[element.id]
          setErrors(newErrors)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Validation error"
        setErrors({ ...errors, [element.id]: errorMessage })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setGlobalError(null)

    try {
      // Validate all required fields
      const newErrors: Record<string, string> = {}
      schema.elements.forEach((element) => {
        if (element.required && (formData[element.name] === null || formData[element.name] === undefined || formData[element.name] === '')) {
          newErrors[element.id] = "This field is required"
        }
      })

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setGlobalError("Please fix all validation errors before submitting")
        setIsSubmitting(false)
        return
      }

      // Submit form
      if (onSubmit) {
        await onSubmit(formData)
      }
    } catch (error) {
      logError("Form submission error", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderElement = (element: FormElement) => {
    // HTML elements (heading, label, paragraph)
    if (element.type === "heading") {
      const HeadingTag = element.headingLevel || "h2"
      return (
        <HeadingTag
          key={element.id}
          className="text-slate-100"
          style={{
            fontSize: element.fontSize,
            fontWeight: element.fontWeight || "600",
            color: element.color,
          }}
        >
          {element.content}
        </HeadingTag>
      )
    }

    if (element.type === "label") {
      return (
        <div
          key={element.id}
          className="text-slate-200"
          style={{
            fontSize: element.fontSize,
            fontWeight: element.fontWeight || "500",
            color: element.color,
          }}
        >
          {element.content}
        </div>
      )
    }

    if (element.type === "paragraph") {
      return (
        <p
          key={element.id}
          className="text-slate-300"
          style={{
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            color: element.color,
          }}
        >
          {element.content}
        </p>
      )
    }

    // Input fields - render without label (user adds labels as separate components)
    const inputBaseClass = "border-slate-500 bg-slate-800 text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 text-sm"
    const errorClass = "border-red-500 bg-slate-800 text-slate-100 focus:border-red-500 focus:ring-red-500 text-sm"

    return (
      <div key={element.id} className="h-full flex flex-col w-full p-0.5">
        {element.type === "text" && (
          <Input
            id={element.id}
            type="text"
            value={formData[element.name] || ""}
            onChange={(e) => handleFieldChange(element, e.target.value)}
            placeholder={element.placeholder || element.label || element.name}
            className={`transition-colors h-full ${errors[element.id] ? errorClass : inputBaseClass}`}
          />
        )}

        {element.type === "number" && (
          <Input
            id={element.id}
            type="number"
            value={formData[element.name] || ""}
            onChange={(e) => handleFieldChange(element, Number.parseFloat(e.target.value))}
            placeholder={element.placeholder || element.label || element.name}
            className={`transition-colors h-full ${errors[element.id] ? errorClass : inputBaseClass}`}
          />
        )}

        {element.type === "email" && (
          <Input
            id={element.id}
            type="email"
            value={formData[element.name] || ""}
            onChange={(e) => handleFieldChange(element, e.target.value)}
            placeholder={element.placeholder || element.label || element.name}
            className={`transition-colors h-full ${errors[element.id] ? errorClass : inputBaseClass}`}
          />
        )}

        {element.type === "date" && (
          <Input
            id={element.id}
            type="date"
            value={formData[element.name] || ""}
            onChange={(e) => handleFieldChange(element, e.target.value)}
            className={`transition-colors h-full ${errors[element.id] ? errorClass : inputBaseClass}`}
          />
        )}

        {element.type === "textarea" && (
          <Textarea
            id={element.id}
            value={formData[element.name] || ""}
            onChange={(e) => handleFieldChange(element, e.target.value)}
            placeholder={element.placeholder || element.label || element.name}
            className={`transition-colors h-full resize-none ${errors[element.id] ? errorClass : inputBaseClass}`}
          />
        )}

        {element.type === "select" && (
          <Select value={formData[element.name] || ""} onValueChange={(value) => handleFieldChange(element, value)}>
            <SelectTrigger className={`transition-colors h-full ${errors[element.id] ? errorClass : inputBaseClass}`}>
              <SelectValue placeholder={element.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {element.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-slate-200 focus:bg-slate-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {element.type === "checkbox" && (
          <div className="flex items-center justify-center h-full">
            <Checkbox
              id={element.id}
              checked={formData[element.name] || false}
              onCheckedChange={(checked) => handleFieldChange(element, checked)}
              className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
          </div>
        )}

        {errors[element.id] && (
          <p className="text-xs text-red-400 absolute -bottom-4">
            {errors[element.id]}
          </p>
        )}
      </div>
    )
  }

  if (schema.elements.length === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground">
        <p>No elements added yet</p>
        <p className="text-xs mt-2">Add elements in the Grid Builder to see the preview</p>
      </Card>
    )
  }

  return (
    <Card className="p-4 shadow-md bg-slate-800 border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="relative rounded-lg border-2 border-slate-600 bg-slate-900"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(100, 116, 139, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100, 116, 139, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `20px 20px`,
            width: `${(schema.formWidth || 12) * 20}px`,
            height: `${(schema.formHeight || 12) * 20}px`,
          }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${schema.formWidth || 12}, 20px)`,
              gridTemplateRows: `repeat(${schema.formHeight || 12}, 20px)`,
            }}
          >
            {schema.elements.map((element) => (
              <div
                key={element.id}
                className="flex"
                style={{
                  gridColumn: `${element.gridX + 1} / span ${element.gridWidth}`,
                  gridRow: `${element.gridY + 1} / span ${element.gridHeight}`,
                }}
              >
                {renderElement(element)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-600">
          <Button type="button" variant="outline" className="border-slate-500 text-black hover:bg-slate-700">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Saving..." : "Save Row"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
