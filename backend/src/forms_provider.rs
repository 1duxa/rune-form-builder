use crate::form_types::{BoolField, DecimalField, FormField, IntField, RawField, TextField};
use rune::alloc::BTreeMap;
use rune::runtime::{Protocol, Value};
use rune::{Any, Module};

#[derive(Any, Debug)]
#[rune(item = ::fieldsModule)]
pub struct FieldsProvider {
    pub fields: BTreeMap<String, Value>,
    pub field_valids: BTreeMap<String, rune::runtime::Function>,
    _populated: bool,
}

#[allow(unused)]
impl FieldsProvider {
    pub fn new() -> Self {
        Self {
            fields: BTreeMap::new(),
            field_valids: BTreeMap::new(),
            _populated: false,
        }
    }

    pub fn insert(
        &mut self,
        name: String,
        field: FormField,
    ) -> Result<(), rune::runtime::RuntimeError> {
        let value = rune::to_value(field)?;
        self.fields.try_insert(name, value)?;
        Ok(())
    }

    pub fn get_field(&self, name: &str) -> Option<FormField> {
        let value = self.fields.get(name)?;
        println!("{:#?}", value);

        rune::from_value(value.clone()).ok()
    }

    pub fn get<T>(&self, name: &str) -> Option<T>
    where
        T: TryFrom<FormField>,
    {
        let field = self.get_field(name)?;
        println!("{:#?}", field);
        field.try_into().ok()
    }

    // Getters
    #[rune::function]
    pub fn get_int(&self, name: &str) -> Option<IntField> {
        self.get::<IntField>(name)
    }

    #[rune::function]
    pub fn get_decimal(&self, name: &str) -> Option<DecimalField> {
        self.get::<DecimalField>(name)
    }

    #[rune::function]
    pub fn get_text(&self, name: &str) -> Option<TextField> {
        self.get::<TextField>(name)
    }

    #[rune::function]
    pub fn get_bool(&self, name: &str) -> Option<BoolField> {
        self.get::<BoolField>(name)
    }

    #[rune::function]
    pub fn get_raw(&self, name: &str) -> Option<RawField> {
        self.get::<RawField>(name)
    }

    // Setters - replace entire field
    #[rune::function]
    pub fn set_int(&mut self, name: String, field: IntField) {
        let form_field = FormField::Int(field);
        if let Ok(value) = rune::to_value(form_field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn set_text(&mut self, name: String, field: TextField) {
        let form_field = FormField::Text(field);
        if let Ok(value) = rune::to_value(form_field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn set_decimal(&mut self, name: String, field: DecimalField) {
        let form_field = FormField::Decimal(field);
        if let Ok(value) = rune::to_value(form_field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn set_bool(&mut self, name: String, field: BoolField) {
        let form_field = FormField::Bool(field);
        if let Ok(value) = rune::to_value(form_field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn set_raw(&mut self, name: String, field: RawField) {
        let form_field = FormField::Raw(field);
        if let Ok(value) = rune::to_value(form_field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn valid(&mut self, name: &str, valid: rune::runtime::Function) -> anyhow::Result<()> {
        _ = self.field_valids.try_insert(name.into(), valid)?;
        Ok(())
    }
    #[rune::function]
    pub fn update_int(
        &mut self,
        name: &str,
        updater: rune::runtime::Function,
    ) -> anyhow::Result<bool> {
        if let Some(field) = self.get::<IntField>(name) {
            let mut field_value = rune::to_value(field)?;

            let result = updater.call::<Value>((field_value,)).into_result()?;

            if let Ok(updated_field) = rune::from_value::<IntField>(result) {
                self.__rune_fn__set_int(name.to_string(), updated_field);
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    #[rune::function]
    pub fn update_text(
        &mut self,
        name: &str,
        updater: rune::runtime::Function,
    ) -> anyhow::Result<bool> {
        if let Some(field) = self.get::<TextField>(name) {
            let field_value = rune::to_value(field)?;
            let result = updater.call::<Value>((field_value,)).into_result()?;
            if let Ok(updated_field) = rune::from_value::<TextField>(result) {
                self.__rune_fn__set_text(name.to_string(), updated_field);
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    #[rune::function]
    pub fn update_decimal(
        &mut self,
        name: &str,
        updater: rune::runtime::Function,
    ) -> anyhow::Result<bool> {
        if let Some(field) = self.get::<DecimalField>(name) {
            let field_value = rune::to_value(field)?;
            let result = updater.call::<Value>((field_value,)).into_result()?;
            if let Ok(updated_field) = rune::from_value::<DecimalField>(result) {
                self.__rune_fn__set_decimal(name.to_string(), updated_field);
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    #[rune::function]
    pub fn update_bool(
        &mut self,
        name: &str,
        updater: rune::runtime::Function,
    ) -> anyhow::Result<bool> {
        if let Some(field) = self.get::<BoolField>(name) {
            let field_value = rune::to_value(field)?;
            let result = updater.call::<Value>((field_value,)).into_result()?;
            if let Ok(updated_field) = rune::from_value::<BoolField>(result) {
                self.__rune_fn__set_bool(name.to_string(), updated_field);
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    #[rune::function]
    pub fn update_raw(
        &mut self,
        name: &str,
        updater: rune::runtime::Function,
    ) -> anyhow::Result<bool> {
        if let Some(field) = self.get::<RawField>(name) {
            let field_value = rune::to_value(field)?;
            let result = updater.call::<Value>((field_value,)).into_result()?;
            if let Ok(updated_field) = rune::from_value::<RawField>(result) {
                self.__rune_fn__set_raw(name.to_string(), updated_field);
                Ok(true)
            } else {
                Ok(false)
            }
        } else {
            Ok(false)
        }
    }

    pub fn make_fields_module() -> Result<Module, rune::ContextError> {
        let mut module = Module::with_crate("fieldsModule")?;

        // Register types
        module.ty::<FieldsProvider>()?;
        module.ty::<FormField>()?;
        module.ty::<IntField>()?;
        module.ty::<DecimalField>()?;
        module.ty::<TextField>()?;
        module.ty::<BoolField>()?;
        module.ty::<RawField>()?;

        module.function_meta(Self::valid)?;

        // Register getters using function_meta
        module.function_meta(Self::get_int)?;
        module.function_meta(Self::get_decimal)?;
        module.function_meta(Self::get_text)?;
        module.function_meta(Self::get_bool)?;
        module.function_meta(Self::get_raw)?;

        // Register setters using function_meta
        module.function_meta(Self::set_int)?;
        module.function_meta(Self::set_text)?;
        module.function_meta(Self::set_decimal)?;
        module.function_meta(Self::set_bool)?;
        module.function_meta(Self::set_raw)?;

        module.function_meta(Self::update_int)?;
        module.function_meta(Self::update_text)?;
        module.function_meta(Self::update_decimal)?;
        module.function_meta(Self::update_bool)?;
        module.function_meta(Self::update_raw)?;

        module.associated_function(
            &Protocol::INDEX_GET,
            |provider: &FieldsProvider, name: String| -> Option<Value> {
                provider.fields.get(&name).cloned().map(|s| s)
            },
        )?;

        module.associated_function(
            &Protocol::INDEX_SET,
            |provider: &mut FieldsProvider, name: String, field: FormField| {
                let value = rune::to_value(field).unwrap();
                let _ = provider.fields.try_insert(name, value);
            },
        )?;

        // Generic get function for type-checked retrieval
        module
            .function(
                "get",
                |provider: &FieldsProvider, name: &str, field_type: &str| -> Option<Value> {
                    let value = provider.fields.get(name)?;
                    let field: FormField = rune::from_value(value.clone()).ok()?;

                    match (field, field_type) {
                        (FormField::Int(f), "Int") => rune::to_value(f).ok(),
                        (FormField::Text(f), "Text") => rune::to_value(f).ok(),
                        (FormField::Decimal(f), "Decimal") => rune::to_value(f).ok(),
                        (FormField::Bool(f), "Bool") => rune::to_value(f).ok(),
                        (FormField::Raw(f), "Raw") => rune::to_value(f).ok(),
                        _ => None,
                    }
                },
            )
            .build()?;

        // Factory function for creating new fields
        module
            .function(
                "new_field",
                |x: i32, y: i32, field_type: &str, name: &str| -> FormField {
                    FormField::new(x, y, field_type, name)
                },
            )
            .build()?;

        Ok(module)
    }
}
