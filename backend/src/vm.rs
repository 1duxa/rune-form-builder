use rune::{
    Context, Diagnostics, Source, Sources, Unit, Vm,
    termcolor::{ColorChoice, StandardStream},
};
use std::sync::Arc;

use crate::forms_provider::FieldsProvider;

#[allow(unused)]
struct RuneProvider;

#[allow(unused)]
impl RuneProvider {
    /// Compile Rune code with FieldsProvider module registered
    pub async fn compile(code: &str) -> anyhow::Result<(Unit, Arc<rune::runtime::RuntimeContext>)> {
        let mut context = Context::with_default_modules()?;

        // Register the FieldsProvider module
        let fields_module = FieldsProvider::make_fields_module()?;
        context.install(fields_module)?;

        let runtime = Arc::new(context.runtime()?);

        let mut source = Sources::new();
        source.insert(Source::new("form_code", code)?)?;
        let mut diagnostics = Diagnostics::new();

        let result = rune::prepare(&mut source)
            .with_context(&context)
            .with_diagnostics(&mut diagnostics)
            .build();

        if !diagnostics.is_empty() {
            let mut writer = StandardStream::stderr(ColorChoice::Always);
            diagnostics.emit(&mut writer, &source)?;
        }

        Ok((result?, runtime))
    }

    /// Create a VM with the compiled unit and runtime
    pub async fn create_vm(
        unit: Unit,
        runtime: Arc<rune::runtime::RuntimeContext>,
    ) -> anyhow::Result<Vm> {
        let unit = Arc::new(unit);
        let vm = Vm::new(runtime, unit);
        Ok(vm)
    }
}

#[cfg(test)]
mod test {
    use anyhow::Result;
    use sqlx::{Column, Row, TypeInfo, postgres::PgPoolOptions};

    use crate::{
        form_types::{BoolField, DecimalField, FormField, IntField, TextField},
        forms_provider::FieldsProvider,
        vm::RuneProvider,
    };

    #[tokio::test]
    async fn test_form_events() -> Result<()> {
        dotenv::dotenv().ok();
        let pool = PgPoolOptions::new()
            .connect(&dotenv::var("DATABASE_URL").unwrap())
            .await?;

        let rows = sqlx::query("SELECT * FROM testing")
            .fetch_all(&pool)
            .await?;

        for (row_idx, row) in rows.iter().enumerate() {
            let mut fields = FieldsProvider::new();

            for col in row.columns() {
                let col_name = col.name().to_string();
                let field = match col.type_info().name() {
                    "INT2" | "INT4" | "INT8" => {
                        match row.try_get::<i64, _>(col_name.as_str()).ok() {
                            Some(value) => FormField::Int(IntField {
                                name: col_name.clone(),
                                value,
                                ..Default::default()
                            }),
                            _ => continue,
                        }
                    }
                    "FLOAT4" | "FLOAT8" | "NUMERIC" => {
                        match row.try_get::<f64, _>(col_name.as_str()).ok() {
                            Some(value) => FormField::Decimal(DecimalField {
                                name: col_name.clone(),
                                value,
                                ..Default::default()
                            }),
                            _ => continue,
                        }
                    }
                    "BOOL" => match row.try_get::<bool, _>(col_name.as_str()).ok() {
                        Some(value) => FormField::Bool(BoolField {
                            name: col_name.clone(),
                            value,
                            ..Default::default()
                        }),
                        _ => continue,
                    },
                    "TEXT" | "VARCHAR" | "NAME" | "BPCHAR" => {
                        match row.try_get::<String, _>(col_name.as_str()).ok() {
                            Some(value) => FormField::Text(TextField {
                                name: col_name.clone(),
                                value,
                                ..Default::default()
                            }),
                            _ => continue,
                        }
                    }
                    _ => {
                        println!("Skipping unknown type: {}", col.type_info().name());
                        continue;
                    }
                };
                _ = fields.insert(col_name, field);
            }

            println!("Row {} fields created: {:?}", row_idx, fields.fields.keys());

            let code = r#"
                pub fn form_init(fields) {
                    let success = fields.update_text("name", |field| {
                        field.value = "asd";
                        field.placeholder = Some("asddasdas");
                        field
                    });
                    let success2 = fields.valid("name", |field| {
                        if (field.value == "asd") {
                            return true;
                        }
                        false
                    });
                    fields
                }
            "#;

            let (unit, runtime) = RuneProvider::compile(code).await.unwrap();

            let mut vm = RuneProvider::create_vm(unit, runtime).await.unwrap();
            let fields1 = vm
                .execute(["form_init"], (fields,))
                .unwrap()
                .async_complete()
                .await
                .unwrap()
                .into_ref::<FieldsProvider>()
                .unwrap();
            println!("{:#?}", fields1);
            let int_field: TextField = fields1
                .__rune_fn__get_text("name")
                .expect("Field should exist");
            println!("Field using Rust get method: {:#?}", int_field);
            println!("Value: {}", int_field.value);

            let is_valid = &fields1.field_valids["name"]
                .call::<bool>((&int_field,))
                .unwrap();

            println!("Rust: Is field {:#?} valid ? {}", &int_field.name, is_valid);
        }

        Ok(())
    }
}
