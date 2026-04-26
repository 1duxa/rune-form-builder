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
    use sqlx::{Column, Row, TypeInfo, postgres::PgPoolOptions, types::BigDecimal};

    use crate::{
        form_types::{DbType, DbValue, Field},
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
                let col_name = col.name();
                let (value, value_type) = match col.type_info().name() {
                    "INT2" => match row.try_get::<i16, _>(col_name) {
                        Ok(value) => (DbValue::Int(value.into()), DbType::Int),
                        Err(e) => {
                            println!("err {e}");
                            continue;
                        }
                    },
                    "INT4" => match row.try_get::<i32, _>(col_name) {
                        Ok(value) => (DbValue::Int(value.into()), DbType::Int),
                        Err(e) => {
                            println!("err {e}");
                            continue;
                        }
                    },
                    "INT8" => match row.try_get::<i64, _>(col_name) {
                        Ok(value) => (DbValue::Int(value), DbType::Int),
                        Err(e) => {
                            println!("err {e}");
                            continue;
                        }
                    },
                    "FLOAT4" => {
                        println!("matched numberic {col_name}");
                        match row.try_get::<f32, _>(col_name) {
                            Ok(value) => (DbValue::Float(value.into()), DbType::Float),
                            Err(e) => {
                                println!("err{e}");
                                continue;
                            }
                        }
                    }
                    "FLOAT8" => {
                        println!("matched numberic {col_name}");
                        match row.try_get::<f64, _>(col_name) {
                            Ok(value) => (DbValue::Float(value.into()), DbType::Float),
                            Err(e) => {
                                println!("err{e}");
                                continue;
                            }
                        }
                    }
                    "NUMERIC" => match row.try_get::<BigDecimal, _>(col_name) {
                        // trash but idk what to do with it for now
                        Ok(value) => (
                            DbValue::Float(value.to_string().parse().unwrap()),
                            DbType::Float,
                        ),
                        Err(e) => {
                            println!("err{e}");
                            continue;
                        }
                    },
                    "BOOL" => match row.try_get::<bool, _>(col_name) {
                        Ok(value) => (DbValue::Bool(value), DbType::Bool),
                        _ => continue,
                    },
                    "TEXT" | "VARCHAR" | "NAME" | "BPCHAR" => {
                        match row.try_get::<String, _>(col_name) {
                            Ok(value) => (DbValue::Text(value), DbType::Text),
                            _ => continue,
                        }
                    }
                    _ => {
                        println!("Skipping unknown type: {}", col.type_info().name());
                        continue;
                    }
                };
                let field = Field::new_raw(0, 0, value, value_type, col_name);

                _ = fields.insert(col_name.to_string(), field);
            }

            println!("Row {} fields created: {:?}", row_idx, fields.fields.keys());

            let code = r#"
                pub fn form_init(fields) {
                    let success = fields.update("name", |field| {
                        field.set_value("TEST");
                        field.placeholder = Some("asddasdas");
                        field
                    });

                    fields.on_change("name", |field| {
                        let v = field.get_value();
                        v == "TEST"
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
            let int_field: Field = fields1.get_field("name").expect("Field should exist");
            println!("Field using Rust get method: {:#?}", int_field);
            println!("Value: {:#?}", int_field.value);

            let is_valid = &fields1.field_valids["name"]
                .call::<bool>((&int_field,))
                .unwrap();

            println!("Rust: Is field {:#?} valid ? {}", &int_field.name, is_valid);
        }

        Ok(())
    }
}
