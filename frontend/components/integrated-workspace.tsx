"use client"
"use client"

import { logger } from "@/lib/logger"

import { useState, useEffect } from "react"
import { CSharpIDE } from "@/components/csharp-ide"
import { GridFormBuilder } from "@/components/grid-form-builder"
import { FormRenderer } from "@/components/form-renderer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormSchema, RowData } from "@/types/form-builder"
import type { CSharpDependency } from "@/types/csharp"
import { Layout, Eye } from "lucide-react"
import { CSharpTemplateGenerator } from "@/lib/csharp-template-generator"

export function IntegratedWorkspace() {
  const [formSchema, setFormSchema] = useState<FormSchema>({
    id: "row-editor",
    name: "Row Editor",
    elements: [],
    formWidth: 36,
    formHeight: 30,
  })

  const [csharpCode, setCSharpCode] = useState("")
  const templateGenerator = new CSharpTemplateGenerator()

  // Generate C# class template whenever form schema changes
  useEffect(() => {
    const template = templateGenerator.generateFormLogicClass(formSchema)
    setCSharpCode(template)
  }, [formSchema])

  const [activeTab, setActiveTab] = useState("builder")

  const [dependencies] = useState<CSharpDependency[]>([
    {
      name: "FormLogic",
      namespace: "FormLogic",
      types: [],
      methods: [],
    },
  ])

  const handleExecuteCode = async (code: string) => {
    const response = await fetch("/api/execute-csharp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName: "Main", args: [] }),
    })
    return response.json()
  }

  const handleFormSubmit = async (data: RowData) => {
    logger.debug("Form submitted", "IntegratedWorkspace")
    // In real implementation, would execute OnSubmit method from C# code
    await new Promise((resolve) => setTimeout(resolve, 500))
    alert("Row saved successfully!")
  }

  const handleFieldChange = async (fieldId: string, value: any) => {
    logger.debug(`Field changed: ${fieldId}`, "IntegratedWorkspace")
    // In real implementation, would execute OnFieldChanged method from C# code
    return value
  }

  const handleValidate = async (fieldId: string, value: any) => {
    logger.debug(`Validating field: ${fieldId}`, "IntegratedWorkspace")
    // In real implementation, would execute OnValidateField method from C# code
    return { valid: true }
  }

  return (
    <div className="flex h-screen w-full bg-slate-900">
      {/* Left: C# IDE */}
      <div className="w-1/2 border-r border-slate-700">
        <CSharpIDE
          initialCode={csharpCode}
          dependencies={dependencies}
          onCodeChange={setCSharpCode}
          onExecute={handleExecuteCode}
        />
      </div>

      {/* Right: Form Builder / Preview */}
      <div className="w-1/2 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-slate-700 px-4 bg-slate-800">
            <TabsList className="bg-slate-900">
              <TabsTrigger value="builder" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
                <Layout className="h-4 w-4" />
                Grid Builder
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder" className="flex-1 m-0">
            <GridFormBuilder schema={formSchema} onSchemaChange={setFormSchema} />
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0 p-4 overflow-y-auto bg-slate-800">
            <FormRenderer
              schema={formSchema}
              onSubmit={handleFormSubmit}
              onFieldChange={handleFieldChange}
              onValidate={handleValidate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
