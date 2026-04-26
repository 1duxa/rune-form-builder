use crate::form_types::{DbValue, Field};
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
        field: Field,
    ) -> Result<(), rune::runtime::RuntimeError> {
        let value = rune::to_value(field)?;
        self.fields.try_insert(name, value)?;
        Ok(())
    }

    pub fn get_field(&self, name: &str) -> Option<Field> {
        let value = self.fields.get(name)?;
        println!("{:#?}", value);

        rune::from_value(value.clone()).ok()
    }

    #[rune::function]
    pub fn set(&mut self, name: String, field: Field) {
        if let Ok(value) = rune::to_value(field) {
            let _ = self.fields.try_insert(name, value);
        }
    }

    #[rune::function]
    pub fn on_change(&mut self, name: &str, valid: rune::runtime::Function) -> anyhow::Result<()> {
        _ = self.field_valids.try_insert(name.into(), valid)?;
        Ok(())
    }

    pub fn validate(&self, name: &str) -> anyhow::Result<bool> {
        let Some(field) = self.get_field(name) else {
            return Ok(false);
        };
        let Some(validator) = self.field_valids.get(name) else {
            return Ok(true); // no validator = valid
        };
        let field_value = rune::to_value(field)?;
        Ok(validator.call::<bool>((field_value,)).into_result()?)
    }

    #[rune::function]
    pub fn update(&mut self, name: &str, updater: rune::runtime::Function) -> anyhow::Result<bool> {
        if let Some(field) = self.get_field(name) {
            let mut field_value = rune::to_value(field)?;

            let result = updater.call::<Value>((field_value,)).into_result()?;

            if let Ok(updated_field) = rune::from_value::<Field>(result) {
                self.__rune_fn__set(name.to_string(), updated_field);
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
        module.ty::<Field>()?;
        module.ty::<DbValue>()?;

        module.function_meta(Self::on_change)?;
        module.function_meta(Self::set)?;
        module.function_meta(Self::update)?;

        module.associated_function(
            &Protocol::INDEX_SET,
            |provider: &mut FieldsProvider, name: String, field: Field| {
                let value = rune::to_value(field).unwrap();
                let _ = provider.fields.try_insert(name, value);
            },
        )?;

        module
            .function(
                "get",
                |provider: &FieldsProvider, name: &str| -> Option<Value> {
                    let value = provider.fields.get(name)?;
                    rune::from_value(value.clone()).ok()?
                },
            )
            .build()?;

        module
            .function(
                "new_field",
                |x: i32, y: i32, field_type: &str, name: &str| -> Field {
                    Field::new(x, y, field_type, name)
                },
            )
            .build()?;

        Ok(module)
    }
}
