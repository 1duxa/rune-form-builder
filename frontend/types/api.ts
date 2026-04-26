// API response types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface HookResponse {
    success: boolean
    result?: unknown
    debugMessages?: string[]
    error?: string
}

export interface ValidationResult {
    isValid: boolean
    errorMessage?: string
}

export interface SchemaColumn {
    name: string
    clrType: string
    nullable: boolean
    isPrimaryKey?: boolean
}

export interface TypeDefinition {
    name: string
    fullName: string
    namespace: string
    isClass: boolean
    isInterface: boolean
    isStatic: boolean
    properties: PropertyDefinition[]
    methods: MethodDefinition[]
}

export interface PropertyDefinition {
    name: string
    type: string
    isPublic: boolean
    isStatic: boolean
}

export interface MethodDefinition {
    name: string
    returnType: string
    parameters: ParameterDefinition[]
    isPublic: boolean
    isStatic: boolean
}

export interface ParameterDefinition {
    name: string
    type: string
}

// Form submission types
export interface SubmissionRequest {
    formId: string
    data: Record<string, unknown>
}

export interface SubmissionResponse {
    success: boolean
    id?: string
    errors?: Record<string, string>
}
