// Client-side hook executor that calls the mock Roslyn APIs
export class HookExecutor {
  async executeValidation(code: string, methodName: string, fieldId: string, value: any) {
    const response = await fetch("/api/hooks/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName, fieldId, value }),
    })

    const result = await response.json()
    return result.result
  }

  async executeOnChange(code: string, methodName: string, fieldId: string, value: any) {
    const response = await fetch("/api/hooks/onchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName, fieldId, value }),
    })

    const result = await response.json()
    return result.result
  }

  async executeTransform(code: string, methodName: string, fieldId: string, value: any) {
    const response = await fetch("/api/hooks/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName, fieldId, value }),
    })

    const result = await response.json()
    return result.result
  }

  async executeSubmit(code: string, methodName: string, formData: Record<string, any>) {
    const response = await fetch("/api/hooks/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, methodName, formData }),
    })

    const result = await response.json()
    return result.result
  }
}
