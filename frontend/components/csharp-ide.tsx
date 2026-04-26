"use client"

import { useState, useRef, useEffect } from "react"
import Editor from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { CSharpParser } from "@/lib/csharp-parser"
import type { CSharpDependency } from "@/types/csharp"
import type { FormSchema } from "@/types/form-builder"
import { Button } from "@/components/ui/button"
import { Play, FileCode, RefreshCw } from "lucide-react"
import { CSharpTemplateGenerator } from "@/lib/csharp-template-generator"
import { FormLogicRuntimeLibrary } from "@/lib/csharp-runtime-lib"
import { configureCSharpLanguage, loadDynamicTypes, VariableTracker, updateCSharpLanguageConfig } from "@/lib/monaco-csharp-config"

interface CSharpIDEProps {
  initialCode?: string
  schema?: FormSchema
  dependencies?: CSharpDependency[]
  onCodeChange?: (code: string) => void
  onExecute?: (code: string) => Promise<any>
}

export function CSharpIDE({ initialCode = "", schema, dependencies = [], onCodeChange, onExecute }: CSharpIDEProps) {
  const [code, setCode] = useState(initialCode)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<string>("")
  const [dynamicTypes, setDynamicTypes] = useState<CSharpDependency[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const parserRef = useRef(new CSharpParser())
  const variableTrackerRef = useRef(new VariableTracker())
  const monacoConfigured = useRef(false)

  // Load dynamic types from backend on mount
  useEffect(() => {
    loadDynamicTypes().then((types) => {
      setDynamicTypes(types)
      setIsLoadingTypes(false)
    })
  }, [])

  useEffect(() => {
    if (initialCode && initialCode !== code) {
      setCode(initialCode)
    }
  }, [initialCode])

  useEffect(() => {
    // Add runtime library
    parserRef.current.addDependency(FormLogicRuntimeLibrary)

    // Add dynamic types from backend
    dynamicTypes.forEach((dep) => {
      parserRef.current.addDependency(dep)
    })

    // Add user dependencies
    dependencies.forEach((dep) => {
      parserRef.current.addDependency(dep)
    })

    // Parse current code to add user types to autocomplete
    if (code) {
      const userDependency = parserRef.current.parseUserCode(code)
      parserRef.current.addDependency(userDependency)
      variableTrackerRef.current.parseCode(code)
    }

    // If Monaco is already configured, push updated deps/user types/variables to providers
    if (monacoConfigured.current) {
      updateCSharpLanguageConfig({
        dependencies: [FormLogicRuntimeLibrary, ...dynamicTypes, ...dependencies],
        getUserTypes: () => {
          if (code) {
            const userDep = parserRef.current.parseUserCode(code)
            return userDep.types
          }
          return []
        },
        getVariables: () => variableTrackerRef.current.getAllVariables(),
      })
    }
  }, [dependencies, code, dynamicTypes])

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor

    // Configure comprehensive C# language support (only once)
    if (!monacoConfigured.current) {
      configureCSharpLanguage(monaco, {
        dependencies: [
          FormLogicRuntimeLibrary,
          ...dynamicTypes,
          ...dependencies,
        ],
        getUserTypes: () => {
          if (code) {
            const userDep = parserRef.current.parseUserCode(code)
            return userDep.types
          }
          return []
        },
        getVariables: () => variableTrackerRef.current.getAllVariables(),
      })
      monacoConfigured.current = true
    }

    // Enable all IntelliSense features
    editor.updateOptions({
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      acceptSuggestionOnEnter: "on",
      snippetSuggestions: "top",
      wordBasedSuggestions: "off",
      parameterHints: {
        enabled: true,
        cycle: true,
      },
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
      },
    })
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ""
    setCode(newCode)
    onCodeChange?.(newCode)

    // Re-parse user code for autocomplete and track variables
    if (newCode) {
      const userDependency = parserRef.current.parseUserCode(newCode)
      parserRef.current.addDependency(userDependency)
      variableTrackerRef.current.parseCode(newCode)
      if (monacoConfigured.current) {
        updateCSharpLanguageConfig({
          getUserTypes: () => {
            const dep = parserRef.current.parseUserCode(newCode)
            return dep.types
          },
          getVariables: () => variableTrackerRef.current.getAllVariables(),
        })
      }
    }
  }

  const handleLoadTemplate = () => {
    if (!schema) {
      alert("No schema available")
      return
    }
    const template = new CSharpTemplateGenerator().generateFormLogicClass(schema)
    setCode(template)
    onCodeChange?.(template)
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    setExecutionResult("")
    try {
      if (onExecute) {
        const result = await onExecute(code)

        // Format the execution result
        if (result.success) {
          let output = "✓ Execution successful\n\n"

          if (result.output !== null && result.output !== undefined) {
            output += "Output:\n" + (typeof result.output === 'object' ? JSON.stringify(result.output, null, 2) : String(result.output)) + "\n"
          }

          if (result.debugMessages && result.debugMessages.length > 0) {
            output += "\nDebug Messages:\n" + result.debugMessages.join("\n") + "\n"
          }

          if (result.warnings && result.warnings.length > 0) {
            output += "\nWarnings:\n" + result.warnings.join("\n")
          }

          setExecutionResult(output)
        } else {
          let errorOutput = "✗ Execution failed\n\n"

          if (result.errors && result.errors.length > 0) {
            errorOutput += "Errors:\n" + result.errors.join("\n\n")
          } else {
            errorOutput += "Unknown error occurred"
          }

          setExecutionResult(errorOutput)
        }
      } else {
        setExecutionResult("// No execution handler configured - connect to Roslyn API for real execution")
      }
    } catch (error: any) {
      setExecutionResult(`✗ Execution error:\n${error.message}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">C# Editor</span>
          <span className="text-xs text-muted-foreground">Override methods to add form logic</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleLoadTemplate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Load Template
          </Button>
          <Button size="sm" variant="outline" onClick={handleExecute} disabled={isExecuting}>
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? "Running..." : "Test Code"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="csharp"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoIndent: "full",
            bracketPairColorization: {
              enabled: true,
            },
          }}
        />
      </div>

      {/* Execution Result */}
      {executionResult && (
        <div className="border-t bg-muted/50 p-4 max-h-48 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-2">OUTPUT</div>
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{executionResult}</pre>
        </div>
      )}
    </div>
  )
}
