import type { CSharpDependency } from "@/types/csharp"

// FormLogicRuntime types for autocomplete
export const FormLogicRuntimeLibrary: CSharpDependency = {
    name: "FormLogicRuntime",
    namespace: "FormLogicRuntime",
    methods: [],
    types: [
        {
            name: "UserFormLogic",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                {
                    name: "Fields",
                    type: "FieldCollection",
                    isPublic: false, // protected
                },
            ],
            methods: [
                {
                    name: "OnFormInit",
                    returnType: "void",
                    parameters: [{ name: "formInitParams", type: "FormInitParams" }],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "OnValidateField",
                    returnType: "ValidationResult",
                    parameters: [
                        { name: "fieldName", type: "string" },
                    ],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "OnFieldChanged",
                    returnType: "void",
                    parameters: [
                        { name: "fieldName", type: "string" },
                    ],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "OnSubmit",
                    returnType: "SubmitResult",
                    parameters: [{ name: "formData", type: "Dictionary<string, object>" }],
                    isPublic: true,
                    isStatic: false,
                },
            ],
        },
        {
            name: "FormInitParams",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                {
                    name: "InitialData",
                    type: "Dictionary<string, object>",
                    isPublic: true,
                },
                {
                    name: "Fields",
                    type: "FieldCollection",
                    isPublic: true,
                },
            ],
            methods: [],
        },
        {
            name: "FieldCollection",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [],
            methods: [
                {
                    name: "Add",
                    returnType: "void",
                    parameters: [{ name: "control", type: "ControlBase" }],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "TryGet",
                    returnType: "bool",
                    parameters: [
                        { name: "fieldName", type: "string" },
                        { name: "control", type: "ControlBase" },
                    ],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "Get",
                    returnType: "T",
                    parameters: [{ name: "fieldName", type: "string" }],
                    isPublic: true,
                    isStatic: false,
                },
                {
                    name: "All",
                    returnType: "IEnumerable<ControlBase>",
                    parameters: [],
                    isPublic: true,
                    isStatic: false,
                },
            ],
        },
        {
            name: "ControlBase",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "TextBox",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "NumberBox",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "EmailBox",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "DatePicker",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "DropDown",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "CheckBox",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "TextArea",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Name", type: "string", isPublic: true },
                { name: "Value", type: "object", isPublic: true },
                { name: "Enabled", type: "bool", isPublic: true },
                { name: "Visible", type: "bool", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "ValidationResult",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "IsValid", type: "bool", isPublic: true },
                { name: "ErrorMessage", type: "string", isPublic: true },
            ],
            methods: [],
        },
        {
            name: "SubmitResult",
            namespace: "FormLogicRuntime",
            isClass: true,
            isInterface: false,
            properties: [
                { name: "Success", type: "bool", isPublic: true },
                { name: "Message", type: "string", isPublic: true },
                { name: "Data", type: "object", isPublic: true },
            ],
            methods: [],
        },
    ],
}
