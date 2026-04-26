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
#[derive(Debug, TryClone, Default, Any)]
pub enum DbType {
    Int,
    Float,
    Bool,
    Text,
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
    pub value: DbValue,
    pub value_type: DbType,
}
impl Field {
    pub fn new(x: i32, y: i32, field_type: &str, name: &str) -> Self {
        let (value, value_type) = match field_type {
            "Int" => (DbValue::Int(0), DbType::Int),
            "Text" => (DbValue::Text(String::new()), DbType::Text),
            "Decimal" => (DbValue::Float(0.0), DbType::Float),
            "Bool" => (DbValue::Bool(false), DbType::Bool),
            _ => (DbValue::Null, DbType::Null),
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
            value_type,
        }
    }
    pub fn new_raw(x: i32, y: i32, value: DbValue, value_type: DbType, name: &str) -> Self {
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
            value_type,
        }
    }

    #[rune::function]
    pub fn set_value(&mut self, value: rune::runtime::Value) -> bool {
        match &self.value_type {
            DbType::Int => {
                if let Ok(n) = rune::from_value::<i64>(value) {
                    self.value = DbValue::Int(n);
                    true
                } else {
                    false
                }
            }
            DbType::Float => {
                if let Ok(f) = rune::from_value::<f64>(value) {
                    self.value = DbValue::Float(f);
                    true
                } else {
                    false
                }
            }
            DbType::Bool => {
                if let Ok(b) = rune::from_value::<bool>(value) {
                    self.value = DbValue::Bool(b);
                    true
                } else {
                    false
                }
            }
            DbType::Text => {
                if let Ok(s) = rune::from_value::<String>(value) {
                    self.value = DbValue::Text(s);
                    true
                } else {
                    false
                }
            }
            DbType::Null => false,
        }
    }
    #[rune::function]
    pub fn get_value(&self) -> rune::runtime::Value {
        match &self.value {
            DbValue::Int(n) => rune::to_value(*n).unwrap(),
            DbValue::Float(f) => rune::to_value(*f).unwrap(),
            DbValue::Bool(b) => rune::to_value(*b).unwrap(),
            DbValue::Text(s) => rune::to_value(s.clone()).unwrap(),
            DbValue::Null => rune::runtime::Value::empty(),
        }
    }
}
