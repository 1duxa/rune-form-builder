import type { CSharpDependency, CSharpType, CSharpMethod, CSharpProperty } from "@/types/csharp"

export class CSharpParser {
  private dependencies: Map<string, CSharpDependency> = new Map()

  addDependency(dependency: CSharpDependency) {
    this.dependencies.set(dependency.namespace, dependency)
  }

  getDependencies(): CSharpDependency[] {
    return Array.from(this.dependencies.values())
  }

  // Parse user code to extract types, methods, properties for autocomplete
  parseUserCode(code: string): CSharpDependency {
    const types: CSharpType[] = []
    const methods: CSharpMethod[] = []

    // Extract namespace
    const namespaceMatch = code.match(/namespace\s+([\w.]+)/)
    const namespace = namespaceMatch ? namespaceMatch[1] : "UserCode"

    // Extract classes
    const classRegex = /(?:public\s+)?class\s+(\w+)[\s\S]*?\{([\s\S]*?)\n\}/g
    let classMatch

    while ((classMatch = classRegex.exec(code)) !== null) {
      const className = classMatch[1]
      const classBody = classMatch[2]

      const properties = this.extractProperties(classBody)
      const classMethods = this.extractMethods(classBody)

      types.push({
        name: className,
        namespace,
        properties,
        methods: classMethods,
        isClass: true,
        isInterface: false,
      })
    }

    // Extract interfaces
    const interfaceRegex = /(?:public\s+)?interface\s+(\w+)[\s\S]*?\{([\s\S]*?)\n\}/g
    let interfaceMatch

    while ((interfaceMatch = interfaceRegex.exec(code)) !== null) {
      const interfaceName = interfaceMatch[1]
      const interfaceBody = interfaceMatch[2]

      const properties = this.extractProperties(interfaceBody)
      const interfaceMethods = this.extractMethods(interfaceBody)

      types.push({
        name: interfaceName,
        namespace,
        properties,
        methods: interfaceMethods,
        isClass: false,
        isInterface: true,
      })
    }

    return {
      name: namespace,
      namespace,
      types,
      methods,
    }
  }

  private extractProperties(body: string): CSharpProperty[] {
    const properties: CSharpProperty[] = []
    const propRegex = /(?:public|private|protected)?\s+(\w+(?:<[\w,\s]+>)?)\s+(\w+)\s*\{[^}]*\}/g
    let match

    while ((match = propRegex.exec(body)) !== null) {
      properties.push({
        name: match[2],
        type: match[1],
        isPublic: body.includes("public"),
      })
    }

    return properties
  }

  private extractMethods(body: string): CSharpMethod[] {
    const methods: CSharpMethod[] = []
    const methodRegex = /(?:public|private|protected)?\s+(\w+(?:<[\w,\s]+>)?)\s+(\w+)\s*$$(.*?)$$/g
    let match

    while ((match = methodRegex.exec(body)) !== null) {
      const returnType = match[1]
      const methodName = match[2]
      const paramsStr = match[3]

      const parameters = this.extractParameters(paramsStr)

      methods.push({
        name: methodName,
        returnType,
        parameters,
        isPublic: body.includes("public"),
      })
    }

    return methods
  }

  private extractParameters(paramsStr: string): Array<{ name: string; type: string }> {
    if (!paramsStr.trim()) return []

    return paramsStr.split(",").map((param) => {
      const parts = param.trim().split(/\s+/)
      return {
        type: parts[0] || "object",
        name: parts[1] || "param",
      }
    })
  }

  // Get all available types for autocomplete
  getAllTypes(): CSharpType[] {
    const types: CSharpType[] = []
    this.dependencies.forEach((dep) => {
      types.push(...dep.types)
    })
    return types
  }

  // Get all available methods for autocomplete
  getAllMethods(): CSharpMethod[] {
    const methods: CSharpMethod[] = []
    this.dependencies.forEach((dep) => {
      methods.push(...dep.methods)
      dep.types.forEach((type) => {
        methods.push(...type.methods)
      })
    })
    return methods
  }
}
