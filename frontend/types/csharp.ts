export interface CSharpFile {
  id: string
  name: string
  content: string
  language: "csharp"
  dependencies?: string[]
}

export interface CSharpDependency {
  name: string
  namespace: string
  types: CSharpType[]
  methods: CSharpMethod[]
}

export interface CSharpType {
  name: string
  namespace: string
  properties: CSharpProperty[]
  methods: CSharpMethod[]
  isClass: boolean
  isInterface: boolean
}

export interface CSharpProperty {
  name: string
  type: string
  isPublic: boolean
}

export interface CSharpMethod {
  name: string
  returnType: string
  parameters: CSharpParameter[]
  isPublic: boolean
  isStatic?: boolean // Added isStatic property for static method detection
}

export interface CSharpParameter {
  name: string
  type: string
}

export interface CompletionItem {
  label: string
  kind: string
  insertText: string
  documentation?: string
}
