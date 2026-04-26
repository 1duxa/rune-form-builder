"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormField } from "@/types/form-builder"
import { Code, Save } from "lucide-react"

interface HookConfiguratorProps {
  field: FormField | null
  hookType: "validation" | "onChange" | "transform" | "submit"
  open: boolean
  onClose: () => void
  onSave: (hookType: string, methodName: string, code: string) => void
  existingCode?: string
}

export function HookConfigurator({ field, hookType, open, onClose, onSave, existingCode = "" }: HookConfiguratorProps) {
  const [methodName, setMethodName] = useState("")
  const [code, setCode] = useState(existingCode)

  const getHookInfo = () => {
    switch (hookType) {
      case "validation":
        return {
          title: "Validation Hook",
          description: "Write C# code to validate the field value. Return ValidationResult.",
          template: `public ValidationResult Validate${field?.name || "Field"}(object value)
{
    // Your validation logic here
    if (value == null || string.IsNullOrEmpty(value.ToString()))
    {
        return new ValidationResult { IsValid = false, ErrorMessage = "Value is required" };
    }
    
    return new ValidationResult { IsValid = true };
}`,
        }
      case "onChange":
        return {
          title: "OnChange Hook",
          description: "Write C# code to handle field value changes. Return the processed value.",
          template: `public object OnChange${field?.name || "Field"}(object value)
{
    // Your onChange logic here
    // Transform or process the value
    
    return value;
}`,
        }
      case "transform":
        return {
          title: "Transform Hook",
          description: "Write C# code to transform the field value before saving.",
          template: `public object Transform${field?.name || "Field"}(object value)
{
    // Your transformation logic here
    // e.g., format, convert, or process the value
    
    return value;
}`,
        }
      case "submit":
        return {
          title: "Submit Hook",
          description: "Write C# code to handle form submission with all field values.",
          template: `public async Task<SubmitResult> OnSubmit(Dictionary<string, object> formData)
{
    // Your submit logic here
    // Access form values: formData["fieldName"]
    
    // Example: API call, database save, etc.
    
    return new SubmitResult { Success = true, Message = "Data saved successfully" };
}`,
        }
      default:
        return { title: "Hook", description: "", template: "" }
    }
  }

  const hookInfo = getHookInfo()

  const handleSave = () => {
    onSave(hookType, methodName || `${hookType}_${field?.name}`, code)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {hookInfo.title} - {field?.label || "Form"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">{hookInfo.description}</div>

          <div>
            <Label htmlFor="method-name">Method Name</Label>
            <Input
              id="method-name"
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              placeholder={`${hookType}_${field?.name || "method"}`}
            />
          </div>

          <div>
            <Label htmlFor="code">C# Code</Label>
            <Textarea
              id="code"
              value={code || hookInfo.template}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              placeholder="Enter your C# code here..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Hook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
