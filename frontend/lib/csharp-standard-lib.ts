import type { CSharpDependency } from "@/types/csharp"

export { FormLogicRuntimeLibrary } from "./csharp-runtime-lib"

// Comprehensive C# Standard Library with extensive type definitions
export const CSharpStandardLibrary: CSharpDependency = {
  name: "System",
  namespace: "System",
  types: [
    {
      name: "Object",
      namespace: "System",
      properties: [],
      methods: [
        {
          name: "ToString",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Equals",
          returnType: "bool",
          parameters: [{ name: "obj", type: "object" }],
          isPublic: true,
        },
        {
          name: "GetHashCode",
          returnType: "int",
          parameters: [],
          isPublic: true,
        },
        {
          name: "GetType",
          returnType: "Type",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Convert",
      namespace: "System",
      properties: [],
      methods: [
        {
          name: "ToInt32",
          returnType: "int",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToDouble",
          returnType: "double",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToDecimal",
          returnType: "decimal",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToBoolean",
          returnType: "bool",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToDateTime",
          returnType: "DateTime",
          parameters: [{ name: "value", type: "object" }],
          isPublic: true,
          isStatic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Guid",
      namespace: "System",
      properties: [
        { name: "Empty", type: "Guid", isPublic: true },
      ],
      methods: [
        {
          name: "NewGuid",
          returnType: "Guid",
          parameters: [],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Parse",
          returnType: "Guid",
          parameters: [{ name: "input", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "TryParse",
          returnType: "bool",
          parameters: [
            { name: "input", type: "string" },
            { name: "result", type: "out Guid" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Boolean",
      namespace: "System",
      properties: [
        { name: "TrueString", type: "string", isPublic: true },
        { name: "FalseString", type: "string", isPublic: true },
      ],
      methods: [
        {
          name: "Parse",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "TryParse",
          returnType: "bool",
          parameters: [
            { name: "value", type: "string" },
            { name: "result", type: "out bool" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Double",
      namespace: "System",
      properties: [
        { name: "MaxValue", type: "double", isPublic: true },
        { name: "MinValue", type: "double", isPublic: true },
        { name: "NaN", type: "double", isPublic: true },
        { name: "PositiveInfinity", type: "double", isPublic: true },
        { name: "NegativeInfinity", type: "double", isPublic: true },
      ],
      methods: [
        {
          name: "Parse",
          returnType: "double",
          parameters: [{ name: "s", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "TryParse",
          returnType: "bool",
          parameters: [
            { name: "s", type: "string" },
            { name: "result", type: "out double" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "IsNaN",
          returnType: "bool",
          parameters: [{ name: "d", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "String",
      namespace: "System",
      properties: [
        { name: "Length", type: "int", isPublic: true },
        { name: "Empty", type: "string", isPublic: true },
      ],
      methods: [
        {
          name: "IsNullOrEmpty",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "IsNullOrWhiteSpace",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Contains",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
        },
        {
          name: "StartsWith",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
        },
        {
          name: "EndsWith",
          returnType: "bool",
          parameters: [{ name: "value", type: "string" }],
          isPublic: true,
        },
        {
          name: "ToLower",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
        {
          name: "ToUpper",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Trim",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Substring",
          returnType: "string",
          parameters: [
            { name: "startIndex", type: "int" },
            { name: "length", type: "int" },
          ],
          isPublic: true,
        },
        {
          name: "Replace",
          returnType: "string",
          parameters: [
            { name: "oldValue", type: "string" },
            { name: "newValue", type: "string" },
          ],
          isPublic: true,
        },
        {
          name: "Split",
          returnType: "string[]",
          parameters: [{ name: "separator", type: "char" }],
          isPublic: true,
        },
        {
          name: "Join",
          returnType: "string",
          parameters: [
            { name: "separator", type: "string" },
            { name: "values", type: "string[]" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Format",
          returnType: "string",
          parameters: [
            { name: "format", type: "string" },
            { name: "args", type: "object[]" },
          ],
          isPublic: true,
          isStatic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "DateTime",
      namespace: "System",
      properties: [
        { name: "Now", type: "DateTime", isPublic: true },
        { name: "UtcNow", type: "DateTime", isPublic: true },
        { name: "Today", type: "DateTime", isPublic: true },
        { name: "Year", type: "int", isPublic: true },
        { name: "Month", type: "int", isPublic: true },
        { name: "Day", type: "int", isPublic: true },
        { name: "Hour", type: "int", isPublic: true },
        { name: "Minute", type: "int", isPublic: true },
        { name: "Second", type: "int", isPublic: true },
      ],
      methods: [
        {
          name: "AddDays",
          returnType: "DateTime",
          parameters: [{ name: "value", type: "double" }],
          isPublic: true,
        },
        {
          name: "AddMonths",
          returnType: "DateTime",
          parameters: [{ name: "months", type: "int" }],
          isPublic: true,
        },
        {
          name: "AddYears",
          returnType: "DateTime",
          parameters: [{ name: "value", type: "int" }],
          isPublic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [{ name: "format", type: "string" }],
          isPublic: true,
        },
        {
          name: "Parse",
          returnType: "DateTime",
          parameters: [{ name: "s", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Int32",
      namespace: "System",
      properties: [
        { name: "MaxValue", type: "int", isPublic: true },
        { name: "MinValue", type: "int", isPublic: true },
      ],
      methods: [
        {
          name: "Parse",
          returnType: "int",
          parameters: [{ name: "s", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "TryParse",
          returnType: "bool",
          parameters: [
            { name: "s", type: "string" },
            { name: "result", type: "out int" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "ToString",
          returnType: "string",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Decimal",
      namespace: "System",
      properties: [
        { name: "MaxValue", type: "decimal", isPublic: true },
        { name: "MinValue", type: "decimal", isPublic: true },
        { name: "Zero", type: "decimal", isPublic: true },
      ],
      methods: [
        {
          name: "Parse",
          returnType: "decimal",
          parameters: [{ name: "s", type: "string" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "TryParse",
          returnType: "bool",
          parameters: [
            { name: "s", type: "string" },
            { name: "result", type: "out decimal" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Round",
          returnType: "decimal",
          parameters: [
            { name: "d", type: "decimal" },
            { name: "decimals", type: "int" },
          ],
          isPublic: true,
          isStatic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Math",
      namespace: "System",
      properties: [
        { name: "PI", type: "double", isPublic: true },
        { name: "E", type: "double", isPublic: true },
      ],
      methods: [
        {
          name: "Abs",
          returnType: "double",
          parameters: [{ name: "value", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Max",
          returnType: "double",
          parameters: [
            { name: "val1", type: "double" },
            { name: "val2", type: "double" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Min",
          returnType: "double",
          parameters: [
            { name: "val1", type: "double" },
            { name: "val2", type: "double" },
          ],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Round",
          returnType: "double",
          parameters: [{ name: "value", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Floor",
          returnType: "double",
          parameters: [{ name: "d", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Ceiling",
          returnType: "double",
          parameters: [{ name: "d", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Sqrt",
          returnType: "double",
          parameters: [{ name: "d", type: "double" }],
          isPublic: true,
          isStatic: true,
        },
        {
          name: "Pow",
          returnType: "double",
          parameters: [
            { name: "x", type: "double" },
            { name: "y", type: "double" },
          ],
          isPublic: true,
          isStatic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
  ],
  methods: [],
}

export const LinqLibrary: CSharpDependency = {
  name: "System.Linq",
  namespace: "System.Linq",
  types: [
    {
      name: "Enumerable",
      namespace: "System.Linq",
      properties: [],
      methods: [
        {
          name: "Where",
          returnType: "IEnumerable<T>",
          parameters: [{ name: "predicate", type: "Func<T, bool>" }],
          isPublic: true,
        },
        {
          name: "Select",
          returnType: "IEnumerable<T>",
          parameters: [{ name: "selector", type: "Func<T, TResult>" }],
          isPublic: true,
        },
        {
          name: "First",
          returnType: "T",
          parameters: [],
          isPublic: true,
        },
        {
          name: "FirstOrDefault",
          returnType: "T",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Any",
          returnType: "bool",
          parameters: [{ name: "predicate", type: "Func<T, bool>" }],
          isPublic: true,
        },
        {
          name: "Count",
          returnType: "int",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Sum",
          returnType: "int",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Average",
          returnType: "double",
          parameters: [],
          isPublic: true,
        },
        {
          name: "OrderBy",
          returnType: "IOrderedEnumerable<T>",
          parameters: [{ name: "keySelector", type: "Func<T, TKey>" }],
          isPublic: true,
        },
        {
          name: "OrderByDescending",
          returnType: "IOrderedEnumerable<T>",
          parameters: [{ name: "keySelector", type: "Func<T, TKey>" }],
          isPublic: true,
        },
        {
          name: "ToList",
          returnType: "List<T>",
          parameters: [],
          isPublic: true,
        },
        {
          name: "ToArray",
          returnType: "T[]",
          parameters: [],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
  ],
  methods: [],
}

export const CollectionsLibrary: CSharpDependency = {
  name: "System.Collections.Generic",
  namespace: "System.Collections.Generic",
  types: [
    {
      name: "List",
      namespace: "System.Collections.Generic",
      properties: [
        { name: "Count", type: "int", isPublic: true },
        { name: "Capacity", type: "int", isPublic: true },
      ],
      methods: [
        {
          name: "Add",
          returnType: "void",
          parameters: [{ name: "item", type: "T" }],
          isPublic: true,
        },
        {
          name: "Remove",
          returnType: "bool",
          parameters: [{ name: "item", type: "T" }],
          isPublic: true,
        },
        {
          name: "Clear",
          returnType: "void",
          parameters: [],
          isPublic: true,
        },
        {
          name: "Contains",
          returnType: "bool",
          parameters: [{ name: "item", type: "T" }],
          isPublic: true,
        },
        {
          name: "IndexOf",
          returnType: "int",
          parameters: [{ name: "item", type: "T" }],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
    {
      name: "Dictionary",
      namespace: "System.Collections.Generic",
      properties: [
        { name: "Count", type: "int", isPublic: true },
        { name: "Keys", type: "KeyCollection", isPublic: true },
        { name: "Values", type: "ValueCollection", isPublic: true },
      ],
      methods: [
        {
          name: "Add",
          returnType: "void",
          parameters: [
            { name: "key", type: "TKey" },
            { name: "value", type: "TValue" },
          ],
          isPublic: true,
        },
        {
          name: "Remove",
          returnType: "bool",
          parameters: [{ name: "key", type: "TKey" }],
          isPublic: true,
        },
        {
          name: "ContainsKey",
          returnType: "bool",
          parameters: [{ name: "key", type: "TKey" }],
          isPublic: true,
        },
        {
          name: "TryGetValue",
          returnType: "bool",
          parameters: [
            { name: "key", type: "TKey" },
            { name: "value", type: "out TValue" },
          ],
          isPublic: true,
        },
      ],
      isClass: true,
      isInterface: false,
    },
  ],
  methods: [],
}
