import type { editor } from "monaco-editor"
import type { CSharpDependency, CSharpType } from "@/types/csharp"
import { logger } from "./logger"

export interface MonacoCSharpConfig {
    dependencies: CSharpDependency[]
    getUserTypes: () => CSharpType[]
    getVariables?: () => Map<string, string>
}

// Current config used by Monaco providers (kept live and updatable)
let currentConfig: MonacoCSharpConfig = {
    dependencies: [],
    getUserTypes: () => [],
}

// Variable tracking for local variables and their types
export class VariableTracker {
    private variables = new Map<string, string>()

    parseCode(code: string) {
        this.variables.clear()

        // Track variable declarations: var name = ...
        const varRegex = /\b(?:var|string|int|bool|double|decimal|float|long|object)\s+(\w+)\s*=/g
        let match
        while ((match = varRegex.exec(code)) !== null) {
            const varName = match[1]
            // Try to infer type from right-hand side
            const afterEquals = code.substring(match.index + match[0].length, match.index + match[0].length + 100)
            const type = this.inferType(afterEquals)
            this.variables.set(varName, type)
        }

        // Track method parameters
        const methodRegex = /\w+\s+\w+\s*\((.*?)\)/g
        while ((match = methodRegex.exec(code)) !== null) {
            const params = match[1]
            const paramRegex = /(\w+(?:<[\w,\s]+>)?)\s+(\w+)/g
            let paramMatch
            while ((paramMatch = paramRegex.exec(params)) !== null) {
                this.variables.set(paramMatch[2], paramMatch[1])
            }
        }

        // Track foreach variables
        const foreachRegex = /foreach\s*\(\s*(?:var|(\w+))\s+(\w+)\s+in/g
        while ((match = foreachRegex.exec(code)) !== null) {
            const type = match[1] || "object"
            const varName = match[2]
            this.variables.set(varName, type)
        }

        // Track Fields.Get<Type>("name")
        const fieldsGetRegex = /var\s+(\w+)\s*=\s*Fields\.Get<(\w+)>\(/g
        while ((match = fieldsGetRegex.exec(code)) !== null) {
            this.variables.set(match[1], match[2])
        }
    }

    private inferType(rhs: string): string {
        if (rhs.match(/^\s*"/)) return "string"
        if (rhs.match(/^\s*\d+\.\d+/)) return "double"
        if (rhs.match(/^\s*\d+/)) return "int"
        if (rhs.match(/^\s*(true|false)/)) return "bool"
        if (rhs.match(/^\s*new\s+(\w+)/)) return RegExp.$1
        if (rhs.match(/Fields\.Get<(\w+)>/)) return RegExp.$1
        return "object"
    }

    getType(varName: string): string | undefined {
        return this.variables.get(varName)
    }

    getAllVariables(): Map<string, string> {
        return this.variables
    }
}

// Fetch dynamic type definitions from backend
export async function loadDynamicTypes(): Promise<CSharpDependency[]> {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5177"
        const response = await fetch(`${baseUrl}/api/types`)
        const data = await response.json()

        // Group types by namespace
        const namespaceMap = new Map<string, any[]>()

        data.types.forEach((type: CSharpType) => {
            const ns = type.namespace || "Global"
            if (!namespaceMap.has(ns)) {
                namespaceMap.set(ns, [])
            }
            namespaceMap.get(ns)!.push({
                name: type.name,
                namespace: type.namespace,
                properties: type.properties,
                methods: type.methods,
                isClass: type.isClass,
                isInterface: type.isInterface,
            })
        })

        // Convert to CSharpDependency array
        const dependencies: CSharpDependency[] = []
        namespaceMap.forEach((types, namespace) => {
            dependencies.push({
                name: namespace,
                namespace: namespace,
                types: types,
                methods: [],
            })
        })

        return dependencies
    } catch (error) {
        logger.error("Failed to load dynamic types", "Monaco", error)
        return []
    }
}

export function updateCSharpLanguageConfig(updated: Partial<MonacoCSharpConfig>) {
    currentConfig = {
        ...currentConfig,
        ...(updated as MonacoCSharpConfig),
        dependencies: updated.dependencies ?? currentConfig.dependencies,
        getUserTypes: updated.getUserTypes ?? currentConfig.getUserTypes,
        getVariables: updated.getVariables ?? currentConfig.getVariables,
    }
}

export function configureCSharpLanguage(monaco: any, config: MonacoCSharpConfig) {
    // Initialize live config
    updateCSharpLanguageConfig(config)
    // Configure C# language
    monaco.languages.register({ id: "csharp" })

    // Set language configuration
    monaco.languages.setLanguageConfiguration("csharp", {
        comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
        },
        brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
        ],
    })

    // Set token provider
    monaco.languages.setMonarchTokensProvider("csharp", {
        keywords: [
            "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked",
            "class", "const", "continue", "decimal", "default", "delegate", "do", "double", "else",
            "enum", "event", "explicit", "extern", "false", "finally", "fixed", "float", "for",
            "foreach", "goto", "if", "implicit", "in", "int", "interface", "internal", "is", "lock",
            "long", "namespace", "new", "null", "object", "operator", "out", "override", "params",
            "private", "protected", "public", "readonly", "ref", "return", "sbyte", "sealed",
            "short", "sizeof", "stackalloc", "static", "string", "struct", "switch", "this",
            "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "unsafe", "ushort",
            "using", "var", "virtual", "void", "volatile", "while",
        ],
        tokenizer: {
            root: [
                [/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
                [/[{}()\[\]]/, "@brackets"],
                [/\d+/, "number"],
                [/"([^"\\]|\\.)*$/, "string.invalid"],
                [/"/, "string", "@string"],
            ],
            string: [
                [/[^"\\]+/, "string"],
                [/\\./, "string.escape"],
                [/"/, "string", "@pop"],
            ],
        },
    })

    // Register comprehensive completion provider
    monaco.languages.registerCompletionItemProvider("csharp", {
        triggerCharacters: [".", " ", "(", "<"],
        provideCompletionItems: (model: any, position: any) => {
            const word = model.getWordUntilPosition(position)
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            }

            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            })

            const currentLine = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            })

            const suggestions: any[] = []

            // Check for member access (after dot)
            const memberMatch = currentLine.match(/(\w+)\s*\.\s*\w*$/)
            if (memberMatch) {
                const typeName = memberMatch[1]
                provideMemberCompletions(typeName, suggestions, range, monaco)
                return { suggestions }
            }

            // Check for new keyword
            if (currentLine.match(/\bnew\s+\w*$/)) {
                provideTypeCompletions(suggestions, range, monaco, true)
                return { suggestions }
            }

            // Check for type after colon (after base class or interface)
            if (currentLine.match(/:\s*\w*$/)) {
                provideTypeCompletions(suggestions, range, monaco, false)
                return { suggestions }
            }

            // Check for generic type parameters
            if (currentLine.match(/<\w*$/)) {
                provideTypeCompletions(suggestions, range, monaco, false)
                return { suggestions }
            }

            // Provide all completions
            provideKeywords(suggestions, range, monaco)
            provideTypeCompletions(suggestions, range, monaco, false)
            provideSnippets(suggestions, range, monaco)

            return { suggestions }
        },
    })

    // Register signature help provider
    monaco.languages.registerSignatureHelpProvider("csharp", {
        signatureHelpTriggerCharacters: ["(", ","],
        provideSignatureHelp: (model: any, position: any) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
            })

            // Find method call
            const match = textUntilPosition.match(/(\w+)\s*\([^)]*$/)
            if (!match) return null

            const methodName = match[1]
            const allTypes = getAllTypes()

            for (const type of allTypes) {
                const method = type.methods.find((m: any) => m.name === methodName)
                if (method) {
                    return {
                        activeSignature: 0,
                        activeParameter: 0,
                        signatures: [
                            {
                                label: `${method.returnType} ${method.name}(${method.parameters.map((p: any) => `${p.type} ${p.name}`).join(", ")})`,
                                parameters: method.parameters.map((p: any) => ({
                                    label: `${p.type} ${p.name}`,
                                })),
                            },
                        ],
                    }
                }
            }

            return null
        },
    })

    // Register hover provider
    monaco.languages.registerHoverProvider("csharp", {
        provideHover: (model: any, position: any) => {
            const word = model.getWordAtPosition(position)
            if (!word) return null

            const allTypes = getAllTypes()
            const type = allTypes.find((t: any) => t.name === word.word)

            if (type) {
                const kind = type.isInterface ? "interface" : "class"
                return {
                    contents: [
                        { value: `**${kind}** ${type.namespace}.${type.name}` },
                        {
                            value: type.methods.length > 0
                                ? `Methods: ${type.methods.map((m: any) => m.name).join(", ")}`
                                : "",
                        },
                    ],
                }
            }

            // Check for method
            for (const type of allTypes) {
                const method = type.methods.find((m: any) => m.name === word.word)
                if (method) {
                    return {
                        contents: [
                            {
                                value: `**${method.isStatic ? "static " : ""}method** ${method.returnType} ${method.name}(${method.parameters.map((p: any) => `${p.type} ${p.name}`).join(", ")})`,
                            },
                        ],
                    }
                }
            }

            return null
        },
    })

    // Register definition provider
    monaco.languages.registerDefinitionProvider("csharp", {
        provideDefinition: (model: any, position: any) => {
            const word = model.getWordAtPosition(position)
            if (!word) return null

            // Search for class definitions in current file
            const text = model.getValue()
            const classMatch = new RegExp(`class\\s+${word.word}\\s*[:{]`, "g")
            const match = classMatch.exec(text)

            if (match) {
                const pos = model.getPositionAt(match.index)
                return {
                    uri: model.uri,
                    range: {
                        startLineNumber: pos.lineNumber,
                        startColumn: pos.column,
                        endLineNumber: pos.lineNumber,
                        endColumn: pos.column + word.word.length,
                    },
                }
            }

            return null
        },
    })

    // Register document formatting provider
    monaco.languages.registerDocumentFormattingEditProvider("csharp", {
        provideDocumentFormattingEdits: (model: any) => {
            // Basic C# formatting rules
            const text = model.getValue()
            let formatted = text
                .replace(/\{\s*/g, "{\n")
                .replace(/\s*\}/g, "\n}")
                .replace(/;\s*/g, ";\n")

            return [
                {
                    range: model.getFullModelRange(),
                    text: formatted,
                },
            ]
        },
    })
}

function getAllTypes(): any[] {
    const allTypes: any[] = []
    currentConfig.dependencies.forEach((dep) => {
        allTypes.push(...dep.types)
    })
    allTypes.push(...currentConfig.getUserTypes())
    return allTypes
}

function provideMemberCompletions(
    typeName: string,
    suggestions: any[],
    range: any,
    monaco: any,
) {
    const allTypes = getAllTypes()

    // Check if it's a variable name - resolve its type
    if (currentConfig.getVariables) {
        const varType = currentConfig.getVariables().get(typeName)
        if (varType) {
            typeName = varType
        }
    }

    // Handle primitive types
    const typeMap: Record<string, string> = {
        string: "String",
        int: "Int32",
        bool: "Boolean",
        double: "Double",
        decimal: "Decimal",
        float: "Single",
        long: "Int64",
        object: "Object",
    }

    if (typeMap[typeName]) {
        typeName = typeMap[typeName]
    }

    const type = allTypes.find((t: any) => t.name === typeName)

    if (type) {
        // Add methods
        type.methods.forEach((method: any) => {
            const params = method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(", ")
            const insertText =
                method.parameters.length > 0
                    ? `${method.name}(${method.parameters.map((p: any, i: number) => `\${${i + 1}:${p.name}}`).join(", ")})`
                    : `${method.name}()`

            suggestions.push({
                label: method.name,
                kind: monaco.languages.CompletionItemKind.Method,
                insertText: insertText,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
                documentation: `${method.returnType} ${method.name}(${params})${method.isStatic ? " (static)" : ""}`,
                detail: method.isStatic ? "static method" : "method",
            })
        })

        // Add properties
        type.properties.forEach((prop: any) => {
            suggestions.push({
                label: prop.name,
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: prop.name,
                range,
                documentation: `${prop.type} ${prop.name}`,
                detail: "property",
            })
        })
    }
}

function provideTypeCompletions(
    suggestions: any[],
    range: any,
    monaco: any,
    isNewContext: boolean,
) {
    const allTypes = getAllTypes()

    allTypes.forEach((type: any) => {
        suggestions.push({
            label: type.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: type.name,
            range,
            documentation: `${type.isInterface ? "interface" : "class"} ${type.namespace}.${type.name}`,
            detail: type.namespace,
        })

        // Add static methods as Type.Method
        if (!isNewContext) {
            type.methods
                .filter((m: any) => m.isStatic)
                .forEach((method: any) => {
                    const params = method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(", ")
                    const insertText =
                        method.parameters.length > 0
                            ? `${type.name}.${method.name}(${method.parameters.map((p: any, i: number) => `\${${i + 1}:${p.name}}`).join(", ")})`
                            : `${type.name}.${method.name}()`

                    suggestions.push({
                        label: `${type.name}.${method.name}`,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: insertText,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        range,
                        documentation: `${method.returnType} ${method.name}(${params}) (static)`,
                        detail: `${type.namespace}.${type.name}`,
                    })
                })
        }
    })
}

function provideKeywords(suggestions: any[], range: any, monaco: any) {
    const keywords = [
        // Access modifiers
        { label: "public", detail: "access modifier" },
        { label: "private", detail: "access modifier" },
        { label: "protected", detail: "access modifier" },
        { label: "internal", detail: "access modifier" },

        // Types
        { label: "class", detail: "type declaration" },
        { label: "interface", detail: "type declaration" },
        { label: "struct", detail: "type declaration" },
        { label: "enum", detail: "type declaration" },
        { label: "record", detail: "type declaration" },

        // Modifiers
        { label: "static", detail: "modifier" },
        { label: "readonly", detail: "modifier" },
        { label: "const", detail: "modifier" },
        { label: "virtual", detail: "modifier" },
        { label: "override", detail: "modifier" },
        { label: "abstract", detail: "modifier" },
        { label: "sealed", detail: "modifier" },
        { label: "async", detail: "modifier" },

        // Primitive types
        { label: "void", detail: "return type" },
        { label: "string", detail: "type" },
        { label: "int", detail: "type" },
        { label: "bool", detail: "type" },
        { label: "double", detail: "type" },
        { label: "decimal", detail: "type" },
        { label: "float", detail: "type" },
        { label: "long", detail: "type" },
        { label: "short", detail: "type" },
        { label: "byte", detail: "type" },
        { label: "char", detail: "type" },
        { label: "object", detail: "type" },
        { label: "var", detail: "implicit type" },
        { label: "dynamic", detail: "type" },

        // Control flow
        { label: "if", detail: "control flow" },
        { label: "else", detail: "control flow" },
        { label: "switch", detail: "control flow" },
        { label: "case", detail: "control flow" },
        { label: "default", detail: "control flow" },
        { label: "for", detail: "loop" },
        { label: "foreach", detail: "loop" },
        { label: "while", detail: "loop" },
        { label: "do", detail: "loop" },
        { label: "break", detail: "control flow" },
        { label: "continue", detail: "control flow" },
        { label: "return", detail: "control flow" },
        { label: "goto", detail: "control flow" },

        // Exception handling
        { label: "try", detail: "exception handling" },
        { label: "catch", detail: "exception handling" },
        { label: "finally", detail: "exception handling" },
        { label: "throw", detail: "exception handling" },

        // Other keywords
        { label: "new", detail: "keyword" },
        { label: "this", detail: "keyword" },
        { label: "base", detail: "keyword" },
        { label: "null", detail: "keyword" },
        { label: "true", detail: "keyword" },
        { label: "false", detail: "keyword" },
        { label: "typeof", detail: "keyword" },
        { label: "sizeof", detail: "keyword" },
        { label: "nameof", detail: "keyword" },
        { label: "await", detail: "async keyword" },
        { label: "using", detail: "directive/statement" },
        { label: "namespace", detail: "namespace declaration" },
        { label: "is", detail: "type testing" },
        { label: "as", detail: "type conversion" },
        { label: "in", detail: "keyword" },
        { label: "out", detail: "parameter modifier" },
        { label: "ref", detail: "parameter modifier" },
        { label: "params", detail: "parameter modifier" },

        // Common types
        { label: "Task", detail: "System.Threading.Tasks.Task" },
        { label: "List", detail: "System.Collections.Generic.List<T>" },
        { label: "Dictionary", detail: "System.Collections.Generic.Dictionary<TKey, TValue>" },
        { label: "IEnumerable", detail: "System.Collections.Generic.IEnumerable<T>" },
        { label: "Array", detail: "System.Array" },
        { label: "Func", detail: "System.Func" },
        { label: "Action", detail: "System.Action" },
    ]

    keywords.forEach((kw) => {
        suggestions.push({
            label: kw.label,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw.label,
            range,
            detail: kw.detail,
        })
    })
}

function provideSnippets(suggestions: any[], range: any, monaco: any) {
    const snippets = [
        {
            label: "prop",
            insertText: "public ${1:int} ${2:PropertyName} { get; set; }",
            documentation: "Property with get and set",
        },
        {
            label: "propfull",
            insertText:
                "private ${1:int} ${2:_field};\npublic ${1:int} ${3:PropertyName}\n{\n    get { return ${2:_field}; }\n    set { ${2:_field} = value; }\n}",
            documentation: "Property with backing field",
        },
        {
            label: "method",
            insertText: "public ${1:void} ${2:MethodName}(${3:})\n{\n    ${4:}\n}",
            documentation: "Public method",
        },
        {
            label: "ctor",
            insertText: "public ${1:ClassName}(${2:})\n{\n    ${3:}\n}",
            documentation: "Constructor",
        },
        {
            label: "for",
            insertText: "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++)\n{\n    ${3:}\n}",
            documentation: "For loop",
        },
        {
            label: "foreach",
            insertText: "foreach (var ${1:item} in ${2:collection})\n{\n    ${3:}\n}",
            documentation: "Foreach loop",
        },
        {
            label: "if",
            insertText: "if (${1:condition})\n{\n    ${2:}\n}",
            documentation: "If statement",
        },
        {
            label: "ifelse",
            insertText: "if (${1:condition})\n{\n    ${2:}\n}\nelse\n{\n    ${3:}\n}",
            documentation: "If-else statement",
        },
        {
            label: "try",
            insertText: "try\n{\n    ${1:}\n}\ncatch (${2:Exception} ${3:ex})\n{\n    ${4:}\n}",
            documentation: "Try-catch block",
        },
        {
            label: "class",
            insertText: "public class ${1:ClassName}\n{\n    ${2:}\n}",
            documentation: "Class declaration",
        },
    ]

    snippets.forEach((snippet) => {
        suggestions.push({
            label: snippet.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: snippet.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
            documentation: snippet.documentation,
            detail: "snippet",
        })
    })
}
