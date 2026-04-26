"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Trash2, GripVertical, Type, Heading1, FileText, Database } from "lucide-react"
import type { FormElement, FormSchema } from "@/types/form-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

interface SchemaColumn {
  name: string
  clrType: string
  nullable: boolean
}

interface GridFormBuilderProps {
  schema?: FormSchema
  onSchemaChange?: (schema: FormSchema) => void
  targetTable?: string
}

const CELL_SIZE = 20

function mapClrTypeToElement(clr: string): FormElement["type"] {
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

export function GridFormBuilder({ schema: initialSchema, onSchemaChange, targetTable }: GridFormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || {
      id: crypto.randomUUID(),
      name: "New Form",
      elements: [],
      formWidth: 36,
      formHeight: 30,
    },
  )

  // Schema columns from target table
  const [schemaColumns, setSchemaColumns] = useState<SchemaColumn[]>([])

  // Sync local state with prop changes
  useEffect(() => {
    if (initialSchema) {
      setSchema(initialSchema)
    }
  }, [initialSchema])

  // Fetch schema columns when targetTable changes
  useEffect(() => {
    if (!targetTable) {
      setSchemaColumns([])
      return
    }
    fetch(`/api/schema/${targetTable}`)
      .then((r) => r.json())
      .then((data) => setSchemaColumns(data.columns || []))
      .catch(() => setSchemaColumns([]))
  }, [targetTable])

  // Compute which schema columns are available (not already added)
  const availableSchemaColumns = schemaColumns.filter(
    (col) => !schema.elements.some((el) => el.name.toLowerCase() === col.name.toLowerCase())
  )

  const [draggingElement, setDraggingElement] = useState<FormElement | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingElement, setResizingElement] = useState<FormElement | null>(null)
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [wasDraggingOrResizing, setWasDraggingOrResizing] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const updateSchema = (updated: FormSchema) => {
    setSchema(updated)
    onSchemaChange?.(updated)
  }

  const addElement = (type: FormElement["type"], nameOverride?: string, labelOverride?: string, requiredOverride?: boolean) => {
    let gridX = 0
    let gridY = 0
    let foundSpot = false

    const defaultWidth = type === "textarea" ? 18 : type === "heading" || type === "paragraph" ? 36 : 9
    const defaultHeight = type === "textarea" ? 9 : 3

    for (let y = 0; y < schema.formHeight && !foundSpot; y++) {
      for (let x = 0; x < schema.formWidth - defaultWidth + 1; x++) {
        if (!isPositionOccupied(x, y, defaultWidth, defaultHeight, null)) {
          gridX = x
          gridY = y
          foundSpot = true
          break
        }
      }
    }

    const newElement: FormElement = {
      id: crypto.randomUUID(),
      name: nameOverride || `element_${schema.elements.length + 1}`,
      type,
      gridX,
      gridY,
      gridWidth: defaultWidth,
      gridHeight: defaultHeight,
    }

    // Set defaults based on type
    if (type === "heading") {
      newElement.content = "Heading"
      newElement.headingLevel = "h2"
    } else if (type === "label") {
      newElement.content = "Label Text"
    } else if (type === "paragraph") {
      newElement.content = "Paragraph text goes here"
    } else {
      newElement.label = labelOverride || `Field ${schema.elements.length + 1}`
      newElement.required = requiredOverride ?? false
    }

    updateSchema({
      ...schema,
      elements: [...schema.elements, newElement],
    })
  }

  const addSchemaField = (columnName: string) => {
    const col = schemaColumns.find((c) => c.name === columnName)
    if (!col) return
    const type = mapClrTypeToElement(col.clrType)
    addElement(type, col.name, col.name, !col.nullable)
  }

  const isPositionOccupied = (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeElement: FormElement | null,
  ): boolean => {
    return schema.elements.some((element) => {
      if (excludeElement && element.id === excludeElement.id) return false

      return (
        x < element.gridX + element.gridWidth &&
        x + width > element.gridX &&
        y < element.gridY + element.gridHeight &&
        y + height > element.gridY
      )
    })
  }

  const handleMouseDown = (element: FormElement, e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    setDraggingElement(element)
    setWasDraggingOrResizing(false)

    const elementRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingElement || !gridRef.current) return
    setWasDraggingOrResizing(true)

    const gridRect = gridRef.current.getBoundingClientRect()
    const relX = e.clientX - gridRect.left - dragOffset.x
    const relY = e.clientY - gridRect.top - dragOffset.y
    const gridX = Math.floor(relX / CELL_SIZE)
    const gridY = Math.floor(relY / CELL_SIZE)

    const clampedX = Math.max(0, Math.min(schema.formWidth - draggingElement.gridWidth, gridX))
    const clampedY = Math.max(0, Math.min(schema.formHeight - draggingElement.gridHeight, gridY))

    if (
      !isPositionOccupied(clampedX, clampedY, draggingElement.gridWidth, draggingElement.gridHeight, draggingElement)
    ) {
      updateSchema({
        ...schema,
        elements: schema.elements.map((e) =>
          e.id === draggingElement.id ? { ...e, gridX: clampedX, gridY: clampedY } : e,
        ),
      })
    }
  }

  const handleMouseUp = () => {
    setDraggingElement(null)
    setResizingElement(null)
  }

  const handleElementClick = (element: FormElement, e: React.MouseEvent) => {
    e.stopPropagation()
    // Only open edit dialog if we weren't dragging or resizing
    if (!wasDraggingOrResizing) {
      setSelectedElement(element)
      setEditDialogOpen(true)
    }
  }

  const updateElement = (id: string, updates: Partial<FormElement>) => {
    updateSchema({
      ...schema,
      elements: schema.elements.map((element) => (element.id === id ? { ...element, ...updates } : element)),
    })
    // Update selectedElement if it's the one being updated
    if (selectedElement?.id === id) {
      setSelectedElement({ ...selectedElement, ...updates })
    }
  }

  const removeElement = (id: string) => {
    updateSchema({
      ...schema,
      elements: schema.elements.filter((element) => element.id !== id),
    })
    setEditDialogOpen(false)
  }

  const handleResizeMouseDown = (element: FormElement, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingElement(element)
    setWasDraggingOrResizing(false)
  }

  const handleResizeMouseMove = (e: React.MouseEvent) => {
    if (!resizingElement || !gridRef.current) return
    setWasDraggingOrResizing(true)

    const gridRect = gridRef.current.getBoundingClientRect()
    const mouseGridX = Math.floor((e.clientX - gridRect.left) / CELL_SIZE)
    const mouseGridY = Math.floor((e.clientY - gridRect.top) / CELL_SIZE)

    const newWidth = Math.max(1, Math.min(schema.formWidth - resizingElement.gridX, mouseGridX - resizingElement.gridX + 1))
    const newHeight = Math.max(1, Math.min(schema.formHeight - resizingElement.gridY, mouseGridY - resizingElement.gridY + 1))

    if (!isPositionOccupied(resizingElement.gridX, resizingElement.gridY, newWidth, newHeight, resizingElement)) {
      updateSchema({
        ...schema,
        elements: schema.elements.map((e) =>
          e.id === resizingElement.id ? { ...e, gridWidth: newWidth, gridHeight: newHeight } : e,
        ),
      })
    }
  }

  const updateFormSize = (width: number, height: number) => {
    const newWidth = Math.max(12, Math.min(48, width))
    const newHeight = Math.max(20, Math.min(60, height))

    // Check if any elements would be out of bounds with new size
    const wouldBeOutOfBounds = schema.elements.some(
      (el) => el.gridX + el.gridWidth > newWidth || el.gridY + el.gridHeight > newHeight
    )

    if (wouldBeOutOfBounds) {
      // Adjust elements that would be out of bounds
      const adjustedElements = schema.elements.map((el) => ({
        ...el,
        gridX: Math.min(el.gridX, newWidth - el.gridWidth),
        gridY: Math.min(el.gridY, newHeight - el.gridHeight),
      }))

      updateSchema({
        ...schema,
        formWidth: newWidth,
        formHeight: newHeight,
        elements: adjustedElements,
      })
    } else {
      updateSchema({
        ...schema,
        formWidth: newWidth,
        formHeight: newHeight,
      })
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm font-medium text-slate-200">Grid Form Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-slate-300">Width:</Label>
            <Input
              type="number"
              value={schema.formWidth}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10)
                if (!isNaN(val)) {
                  updateFormSize(val, schema.formHeight)
                }
              }}
              className="w-16 h-7 text-xs bg-slate-700 border-slate-600 text-slate-200"
              min={12}
              max={48}
            />
            <Label className="text-xs text-slate-300">Height:</Label>
            <Input
              type="number"
              value={schema.formHeight}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10)
                if (!isNaN(val)) {
                  updateFormSize(schema.formWidth, val)
                }
              }}
              className="w-16 h-7 text-xs bg-slate-700 border-slate-600 text-slate-200"
              min={20}
              max={60}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {/* Schema Fields Dropdown - only show available (not yet added) columns */}
          {targetTable && availableSchemaColumns.length > 0 && (
            <Select onValueChange={(value) => addSchemaField(value)}>
              <SelectTrigger className="w-[180px] h-8 border-slate-600 bg-slate-700 text-slate-200">
                <Database className="mr-2 h-3 w-3 text-slate-400" />
                <SelectValue placeholder="Add DB Field..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {availableSchemaColumns.map((col) => (
                  <SelectItem key={col.name} value={col.name} className="text-slate-200 focus:bg-slate-700">
                    <span className="font-medium">{col.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({col.clrType})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select onValueChange={(value: any) => addElement(value)}>
            <SelectTrigger className="w-[180px] h-8 border-slate-600 bg-slate-700 text-slate-200">
              <SelectValue placeholder="Add Element..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="text" className="text-slate-200 focus:bg-slate-700">
                <Type className="inline mr-2 h-3 w-3" />
                TextBox
              </SelectItem>
              <SelectItem value="number" className="text-slate-200 focus:bg-slate-700">Number Input</SelectItem>
              <SelectItem value="email" className="text-slate-200 focus:bg-slate-700">Email Input</SelectItem>
              <SelectItem value="date" className="text-slate-200 focus:bg-slate-700">Date Picker</SelectItem>
              <SelectItem value="select" className="text-slate-200 focus:bg-slate-700">Dropdown</SelectItem>
              <SelectItem value="checkbox" className="text-slate-200 focus:bg-slate-700">Checkbox</SelectItem>
              <SelectItem value="textarea" className="text-slate-200 focus:bg-slate-700">Text Area</SelectItem>
              <SelectItem value="heading" className="text-slate-200 focus:bg-slate-700">
                <Heading1 className="inline mr-2 h-3 w-3" />
                Heading
              </SelectItem>
              <SelectItem value="label" className="text-slate-200 focus:bg-slate-700">
                <FileText className="inline mr-2 h-3 w-3" />
                Label
              </SelectItem>
              <SelectItem value="paragraph" className="text-slate-200 focus:bg-slate-700">Paragraph</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4 bg-slate-800">
        <div
          ref={gridRef}
          className="relative border-2 border-slate-600 bg-slate-900 rounded-lg shadow-lg"
          style={{
            width: schema.formWidth * CELL_SIZE,
            height: schema.formHeight * CELL_SIZE,
            backgroundImage: `
              linear-gradient(to right, rgba(100, 116, 139, 0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100, 116, 139, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
          }}
          onMouseMove={(e) => {
            handleMouseMove(e)
            handleResizeMouseMove(e)
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {schema.elements.map((element) => (
            <div
              key={element.id}
              className="absolute cursor-move group"
              style={{
                left: element.gridX * CELL_SIZE,
                top: element.gridY * CELL_SIZE,
                width: element.gridWidth * CELL_SIZE,
                height: element.gridHeight * CELL_SIZE,
              }}
              onMouseDown={(e) => handleMouseDown(element, e)}
              onClick={(e) => handleElementClick(element, e)}
            >
              <Card className={`h-full flex flex-col p-2 transition-all border ${selectedElement?.id === element.id
                ? "border-blue-400 bg-slate-800 shadow-lg ring-2 ring-blue-400/50"
                : !["heading", "label", "paragraph"].includes(element.type)
                  ? "border-slate-600 bg-slate-700 hover:border-blue-400 hover:shadow-md"
                  : "border-slate-600 bg-slate-800 hover:border-blue-400 hover:shadow-md"
                }`}>
                <div className="flex items-start justify-between gap-1">
                  <GripVertical className="h-4 w-4 text-slate-400 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate text-slate-200">
                      {element.content || element.label || element.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{element.type}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeElement(element.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100"
                  onMouseDown={(e) => handleResizeMouseDown(element, e)}
                >
                  <div className="w-full h-full border-r-2 border-b-2 border-blue-400 rounded-br" />
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit Element Properties</DialogTitle>
          </DialogHeader>
          {selectedElement && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-200">Element Name (ID)</Label>
                <Input
                  value={selectedElement.name}
                  onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                  placeholder="element_name"
                  className="bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>

              <div>
                <Label className="text-slate-200">Type</Label>
                <Select
                  value={selectedElement.type}
                  onValueChange={(value: any) => updateElement(selectedElement.id, { type: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="text" className="text-slate-200 focus:bg-slate-700">TextBox</SelectItem>
                    <SelectItem value="number" className="text-slate-200 focus:bg-slate-700">Number</SelectItem>
                    <SelectItem value="email" className="text-slate-200 focus:bg-slate-700">Email</SelectItem>
                    <SelectItem value="date" className="text-slate-200 focus:bg-slate-700">Date</SelectItem>
                    <SelectItem value="select" className="text-slate-200 focus:bg-slate-700">Select</SelectItem>
                    <SelectItem value="checkbox" className="text-slate-200 focus:bg-slate-700">Checkbox</SelectItem>
                    <SelectItem value="textarea" className="text-slate-200 focus:bg-slate-700">Textarea</SelectItem>
                    <SelectItem value="heading" className="text-slate-200 focus:bg-slate-700">Heading</SelectItem>
                    <SelectItem value="label" className="text-slate-200 focus:bg-slate-700">Label</SelectItem>
                    <SelectItem value="paragraph" className="text-slate-200 focus:bg-slate-700">Paragraph</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* HTML Elements (heading, label, paragraph) */}
              {(selectedElement.type === "heading" ||
                selectedElement.type === "label" ||
                selectedElement.type === "paragraph") && (
                  <>
                    <div>
                      <Label className="text-slate-200">Content</Label>
                      <Textarea
                        value={selectedElement.content || ""}
                        onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                        placeholder="Enter text content"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                    {selectedElement.type === "heading" && (
                      <div>
                        <Label className="text-slate-200">Heading Level</Label>
                        <Select
                          value={selectedElement.headingLevel || "h2"}
                          onValueChange={(value: any) => updateElement(selectedElement.id, { headingLevel: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="h1" className="text-slate-200 focus:bg-slate-700">H1</SelectItem>
                            <SelectItem value="h2" className="text-slate-200 focus:bg-slate-700">H2</SelectItem>
                            <SelectItem value="h3" className="text-slate-200 focus:bg-slate-700">H3</SelectItem>
                            <SelectItem value="h4" className="text-slate-200 focus:bg-slate-700">H4</SelectItem>
                            <SelectItem value="h5" className="text-slate-200 focus:bg-slate-700">H5</SelectItem>
                            <SelectItem value="h6" className="text-slate-200 focus:bg-slate-700">H6</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-200">Font Size</Label>
                        <Input
                          value={selectedElement.fontSize || ""}
                          onChange={(e) => updateElement(selectedElement.id, { fontSize: e.target.value })}
                          placeholder="e.g. 16px, 1rem"
                          className="bg-slate-700 border-slate-600 text-slate-200"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Font Weight</Label>
                        <Select
                          value={selectedElement.fontWeight || "normal"}
                          onValueChange={(value) => updateElement(selectedElement.id, { fontWeight: value })}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="normal" className="text-slate-200 focus:bg-slate-700">Normal</SelectItem>
                            <SelectItem value="bold" className="text-slate-200 focus:bg-slate-700">Bold</SelectItem>
                            <SelectItem value="600" className="text-slate-200 focus:bg-slate-700">Semi-bold</SelectItem>
                            <SelectItem value="300" className="text-slate-200 focus:bg-slate-700">Light</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-200">Text Color</Label>
                      <Input
                        value={selectedElement.color || ""}
                        onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                        placeholder="e.g. #000000, rgb(0,0,0)"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                  </>
                )}

              {/* Input Fields */}
              {selectedElement.type !== "heading" &&
                selectedElement.type !== "label" &&
                selectedElement.type !== "paragraph" && (
                  <>
                    <div>
                      <Label className="text-slate-200">Label</Label>
                      <Input
                        value={selectedElement.label || ""}
                        onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
                        placeholder="Field label"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Placeholder</Label>
                      <Input
                        value={selectedElement.placeholder || ""}
                        onChange={(e) => updateElement(selectedElement.id, { placeholder: e.target.value })}
                        placeholder="Placeholder text"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-200">Default Value</Label>
                      <Input
                        value={selectedElement.defaultValue || ""}
                        onChange={(e) => updateElement(selectedElement.id, { defaultValue: e.target.value })}
                        placeholder="Default value"
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedElement.required}
                        onCheckedChange={(checked) =>
                          updateElement(selectedElement.id, { required: checked as boolean })
                        }
                        className="border-slate-500 data-[state=checked]:bg-blue-600"
                      />
                      <Label className="text-slate-200">Required Field</Label>
                    </div>

                    {selectedElement.type === "select" && (
                      <div>
                        <Label className="text-slate-200">Options (one per line, format: label:value)</Label>
                        <Textarea
                          value={
                            selectedElement.options?.map((o) => `${o.label}:${o.value}`).join("\n") ||
                            "Option 1:value1\nOption 2:value2"
                          }
                          onChange={(e) => {
                            const options = e.target.value.split("\n").map((line) => {
                              const [label, value] = line.split(":")
                              return { label: label?.trim() || "", value: value?.trim() || label?.trim() || "" }
                            })
                            updateElement(selectedElement.id, { options })
                          }}
                          rows={5}
                          className="bg-slate-700 border-slate-600 text-slate-200"
                        />
                      </div>
                    )}
                  </>
                )}

              <div className="pt-4 border-t border-slate-700">
                <Button variant="destructive" onClick={() => removeElement(selectedElement.id)} className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Element
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
