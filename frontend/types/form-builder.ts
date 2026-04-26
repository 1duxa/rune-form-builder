export type ElementType =
  | "text"
  | "number"
  | "email"
  | "date"
  | "select"
  | "checkbox"
  | "textarea"
  | "heading"
  | "label"
  | "paragraph"

export interface FormElement {
  id: string
  name: string
  type: ElementType
  // For input fields
  label?: string
  required?: boolean
  placeholder?: string
  defaultValue?: any
  options?: { label: string; value: any }[]
  validation?: string
  onChange?: string
  transform?: string
  // For HTML elements (heading, label, paragraph)
  content?: string
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  fontSize?: string
  fontWeight?: string
  color?: string
  // Grid positioning
  gridX: number
  gridY: number
  gridWidth: number
  gridHeight: number
}

export interface FormSchema {
  id: string
  name: string
  elements: FormElement[]
  formWidth: number // in grid columns
  formHeight: number // in grid rows
  onSubmit?: string
  onValidate?: string
}

export interface TableColumn {
  name: string
  type: string
  nullable: boolean
  isPrimaryKey: boolean
}

export interface RowData {
  [key: string]: any
}

export interface FormHook {
  fieldId: string
  hookType: "validation" | "onChange" | "transform" | "submit"
  csharpMethod: string
  enabled: boolean
}
