"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Settings, Code } from "lucide-react"
import type { FormField, FormSchema } from "@/types/form-builder"

interface FormBuilderProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  onHookClick?: (field: FormField, hookType: string) => void
}

export function FormBuilder({ schema: initialSchema, onSchemaChange, onHookClick }: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || {
      id: crypto.randomUUID(),
      name: "New Form",
      fields: [],
    },
  )

  const [editingField, setEditingField] = useState<string | null>(null)

  const addField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      name: `field_${schema.fields.length + 1}`,
      label: `Field ${schema.fields.length + 1}`,
      type: "text",
      required: false,
    }

    const updated = {
      ...schema,
      fields: [...schema.fields, newField],
    }
    setSchema(updated)
    onSchemaChange?.(updated)
    setEditingField(newField.id)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    const updated = {
      ...schema,
      fields: schema.fields.map((field) => (field.id === id ? { ...field, ...updates } : field)),
    }
    setSchema(updated)
    onSchemaChange?.(updated)
  }

  const removeField = (id: string) => {
    const updated = {
      ...schema,
      fields: schema.fields.filter((field) => field.id !== id),
    }
    setSchema(updated)
    onSchemaChange?.(updated)
    if (editingField === id) {
      setEditingField(null)
    }
  }

  const handleHookClick = (field: FormField, hookType: string) => {
    onHookClick?.(field, hookType)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Form Builder</span>
        </div>
        <Button size="sm" onClick={addField}>
          <Plus className="mr-2 h-4 w-4" />
          Add Field
        </Button>
      </div>

      {/* Builder Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fields List */}
        <div className="w-1/2 overflow-y-auto border-r p-4">
          <div className="space-y-3">
            {schema.fields.map((field) => (
              <Card
                key={field.id}
                className={`p-4 cursor-pointer transition-colors ${
                  editingField === field.id ? "border-primary bg-accent" : "hover:bg-accent/50"
                }`}
                onClick={() => setEditingField(field.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.label}</span>
                      {field.required && <span className="text-xs text-destructive">*</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {field.type} • {field.name}
                    </div>
                    {/* Hook indicators */}
                    <div className="flex gap-1 mt-2">
                      {field.validation && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHookClick(field, "validation")
                          }}
                        >
                          <Code className="mr-1 h-3 w-3" />
                          Validation
                        </Button>
                      )}
                      {field.onChange && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHookClick(field, "onChange")
                          }}
                        >
                          <Code className="mr-1 h-3 w-3" />
                          OnChange
                        </Button>
                      )}
                      {field.transform && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHookClick(field, "transform")
                          }}
                        >
                          <Code className="mr-1 h-3 w-3" />
                          Transform
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeField(field.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}

            {schema.fields.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Settings className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">No fields yet</p>
                <p className="text-xs mt-1">Click "Add Field" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Field Editor */}
        <div className="w-1/2 overflow-y-auto p-4">
          {editingField ? (
            <FieldEditor
              field={schema.fields.find((f) => f.id === editingField)!}
              onUpdate={(updates) => updateField(editingField, updates)}
              onHookClick={(hookType) => handleHookClick(schema.fields.find((f) => f.id === editingField)!, hookType)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Code className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a field to edit</p>
              <p className="text-xs mt-1">or add a new field to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FieldEditorProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onHookClick: (hookType: string) => void
}

function FieldEditor({ field, onUpdate, onHookClick }: FieldEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Field Properties</h3>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            value={field.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="field_name"
          />
        </div>

        <div>
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Field Label"
          />
        </div>

        <div>
          <Label htmlFor="field-type">Type</Label>
          <Select value={field.type} onValueChange={(value: any) => onUpdate({ type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="field-placeholder">Placeholder</Label>
          <Input
            id="field-placeholder"
            value={field.placeholder || ""}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Enter placeholder text"
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="field-required"
            checked={field.required}
            onCheckedChange={(checked) => onUpdate({ required: checked as boolean })}
          />
          <Label htmlFor="field-required" className="cursor-pointer">
            Required field
          </Label>
        </div>
      </div>

      <div className="border-t pt-4 mt-6">
        <h4 className="text-sm font-semibold mb-3">C# Hooks</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded border bg-muted/30">
            <div>
              <div className="text-sm font-medium">Validation</div>
              <div className="text-xs text-muted-foreground">{field.validation || "No validation method"}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onHookClick("validation")}>
              <Code className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 rounded border bg-muted/30">
            <div>
              <div className="text-sm font-medium">OnChange Handler</div>
              <div className="text-xs text-muted-foreground">{field.onChange || "No onChange method"}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onHookClick("onChange")}>
              <Code className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-2 rounded border bg-muted/30">
            <div>
              <div className="text-sm font-medium">Data Transform</div>
              <div className="text-xs text-muted-foreground">{field.transform || "No transform method"}</div>
            </div>
            <Button size="sm" variant="outline" onClick={() => onHookClick("transform")}>
              <Code className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
