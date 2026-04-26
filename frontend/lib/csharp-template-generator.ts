import type { FormSchema } from "@/types/form-builder"

export class CSharpTemplateGenerator {
    generateFormLogicClass(schema: FormSchema): string {
        const fieldsInit = schema.elements
            .filter((el) => !["heading", "label", "paragraph"].includes(el.type))
            .map((element) => {
                const fieldType = this.mapFieldTypeToControl(element.type)
                return `        // ${element.label || element.name}\n        var ${element.name} = Fields.Get<${fieldType}>("${element.name}");`
            })
            .join("\n")

        return `using System;
using System.Collections.Generic;
using FormLogicRuntime;

public class FormLogic : UserFormLogic
{
    // Convenience entry point for quick execution tests
    public static object Main()
    {
        Debug.Alert("Hello from C# code execution!");
        Debug.Alert("Code execution is working correctly.");
        return "Execution completed successfully";
    }

    public override void OnFormInit(FormInitParams formInitParams)
    {
        base.OnFormInit(formInitParams);

${fieldsInit || "        // No input fields added yet"}

        // Add your initialization logic here
        // Example: Debug.Alert($"Form initialized with {Fields.All().Count()} fields");
    }

    public override ValidationResult OnValidateField(string fieldName)
    {
        // Access field value via Fields collection - the single source of truth
        // Example: var field = Fields.Get<TextBox>("MyField");
        //          var value = field.Value;
        return new ValidationResult(true);
    }

    public override void OnFieldChanged(string fieldName)
    {
        // Access all field values via Fields collection - the single source of truth
        // Example: var myField = Fields.Get<TextBox>("MyField");
        //          Debug.Alert($"Field {fieldName} changed, MyField value: {myField.Value}");
    }

    public override SubmitResult OnSubmit(Dictionary<string, object> formData)
    {
        // Add your form submission logic here
        // Example: Debug.Alert($"Submitting form with {formData.Count} fields");
        return new SubmitResult(true, "Form submitted successfully", formData);
    }
}`
    }

    private mapFieldTypeToControl(fieldType: string): string {
        const mapping: Record<string, string> = {
            text: "TextBox",
            number: "NumberBox",
            email: "EmailBox",
            date: "DatePicker",
            select: "DropDown",
            checkbox: "CheckBox",
            textarea: "TextArea",
        }
        return mapping[fieldType] || "TextBox"
    }
}
