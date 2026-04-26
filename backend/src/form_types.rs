use rune::{Any, alloc::clone::TryClone};
use sqlx::prelude::FromRow;

#[derive(Debug, TryClone, Default, Any)]
pub enum DbValue {
    #[rune(constructor)]
    Int(#[rune(get)] i64),
    #[rune(constructor)]
    Float(#[rune(get)] f64),
    #[rune(constructor)]
    Bool(#[rune(get)] bool),
    #[rune(constructor)]
    Text(#[rune(get)] String),
    #[rune(constructor)]
    #[default]
    Null,
}
#[allow(unused)]
#[derive(Debug, TryClone, Any, Default, FromRow)]
#[rune(item = ::fieldsModule)]
pub struct Field {
    #[rune(get, set)]
    pub x: i32,
    #[rune(get, set)]
    pub y: i32,
    #[rune(get, set)]
    pub name: String,
    #[rune(get, set)]
    pub label: Option<String>,
    #[rune(get, set)]
    pub placeholder: Option<String>,
    #[rune(get, set)]
    pub required: bool,
    #[rune(get, set)]
    pub enabled: bool,
    #[rune(get, set)]
    pub visible: bool,
    #[rune(get, set)]
    pub value: DbValue,
}
impl Field {
    pub fn new(x: i32, y: i32, field_type: &str, name: &str) -> Self {
        let value = match field_type {
            "Int" => DbValue::Int(0),
            "Text" => DbValue::Text(String::new()),
            "Decimal" => DbValue::Float(0.0),
            "Bool" => DbValue::Bool(false),
            _ => DbValue::Null,
        };
        Self {
            x,
            y,
            name: name.into(),
            label: None,
            placeholder: None,
            required: false,
            enabled: false,
            visible: true,
            value,
        }
    }
}
