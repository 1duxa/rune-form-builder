// Monaco Editor types
import type { editor, languages, Position, CancellationToken, IDisposable } from "monaco-editor"

export interface MonacoCompletionItem {
    label: string
    kind: languages.CompletionItemKind
    insertText: string
    detail?: string
    documentation?: string
}

export interface MonacoProviderResult<T> {
    suggestions: T[]
}

export type CompletionProvider = {
    provideCompletionItems: (
        model: editor.ITextModel,
        position: Position,
        context: languages.CompletionContext,
        token: CancellationToken
    ) => languages.ProviderResult<languages.CompletionList>
}

export type HoverProvider = {
    provideHover: (
        model: editor.ITextModel,
        position: Position,
        token: CancellationToken
    ) => languages.ProviderResult<languages.Hover>
}

export interface EditorConfig {
    theme: string
    language: string
    minimap: { enabled: boolean }
    fontSize: number
    lineNumbers: "on" | "off" | "relative"
    automaticLayout: boolean
}

export interface CSharpType {
    name: string
    fullName: string
    namespace: string
    isClass: boolean
    isInterface: boolean
    isStatic: boolean
    properties: Array<{
        name: string
        type: string
        isPublic: boolean
        isStatic: boolean
    }>
    methods: Array<{
        name: string
        returnType: string
        parameters: Array<{
            name: string
            type: string
        }>
        isPublic: boolean
        isStatic: boolean
    }>
}
