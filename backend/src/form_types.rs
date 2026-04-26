use rune::{Any, Value, alloc::clone::TryClone};

#[derive(Debug, TryClone, Any)]
#[rune(item = ::fieldsModule)]
pub enum FormField {
    Text(TextField),
    Int(IntField),
    Decimal(DecimalField),
    Bool(BoolField),
    Raw(RawField),
}
impl FormField {
    pub fn new(x: i32, y: i32, field_type: &str, name: &str) -> Self {
        match field_type {
            "Int" => Self::Int(IntField {
                x: x,
                y: y,
                name: name.to_string(),
                label: None,
                placeholder: None,
                required: false,
                enabled: false,
                visible: false,
                value: 0,
            }),
            "Text" => Self::Text(TextField {
                x: x,
                y: y,
                name: name.to_string(),
                label: None,
                placeholder: None,
                required: false,
                enabled: false,
                visible: false,
                value: String::new(),
            }),
            "Decimal" => Self::Decimal(DecimalField {
                x: x,
                y: y,
                name: name.to_string(),
                label: None,
                placeholder: None,
                required: false,
                enabled: false,
                visible: false,
                value: 0.0,
            }),
            "Bool" => Self::Bool(BoolField {
                x: x,
                y: y,
                name: name.to_string(),
                label: None,
                placeholder: None,
                required: false,
                enabled: false,
                visible: false,
                value: false,
            }),
            _ => Self::Raw(RawField {
                x: x,
                y: y,
                name: name.to_string(),
                label: None,
                placeholder: None,
                required: false,
                enabled: false,
                visible: false,
                value: Value::empty(),
            }),
        }
    }
}
impl TryFrom<FormField> for IntField {
    type Error = &'static str;

    fn try_from(field: FormField) -> Result<Self, Self::Error> {
        match field {
            FormField::Int(f) => Ok(f),
            _ => Err("Field is not an IntField"),
        }
    }
}

impl TryFrom<FormField> for TextField {
    type Error = &'static str;

    fn try_from(field: FormField) -> Result<Self, Self::Error> {
        match field {
            FormField::Text(f) => Ok(f),
            _ => Err("Field is not a TextField"),
        }
    }
}

impl TryFrom<FormField> for DecimalField {
    type Error = &'static str;

    fn try_from(field: FormField) -> Result<Self, Self::Error> {
        match field {
            FormField::Decimal(f) => Ok(f),
            _ => Err("Field is not a DecimalField"),
        }
    }
}

impl TryFrom<FormField> for BoolField {
    type Error = &'static str;

    fn try_from(field: FormField) -> Result<Self, Self::Error> {
        match field {
            FormField::Bool(f) => Ok(f),
            _ => Err("Field is not a BoolField"),
        }
    }
}

impl TryFrom<FormField> for RawField {
    type Error = &'static str;

    fn try_from(field: FormField) -> Result<Self, Self::Error> {
        match field {
            FormField::Raw(f) => Ok(f),
            _ => Err("Field is not a RawField"),
        }
    }
}
#[allow(unused)]
#[derive(Debug, TryClone, Any, Default)]
#[rune(item = ::fieldsModule)]
pub struct IntField {
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
    pub value: i64,
}
#[allow(unused)]
#[derive(Debug, TryClone, Any)]
#[rune(item = ::fieldsModule)]
pub struct RawField {
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
    pub value: rune::Value,
}
impl Default for RawField {
    fn default() -> Self {
        Self {
            value: rune::Value::empty(),
            x: 0,
            y: 0,
            name: String::default(),
            label: None,
            placeholder: None,
            required: false,
            enabled: false,
            visible: false,
        }
    }
}
#[allow(unused)]
#[derive(Debug, TryClone, Any, Default)]
#[rune(item = ::fieldsModule)]
pub struct DecimalField {
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
    pub value: f64,
}

#[allow(unused)]
#[derive(Debug, TryClone, Any, Default)]
#[rune(item = ::fieldsModule)]
pub struct TextField {
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
    pub value: String,
}
#[allow(unused)]
#[derive(Debug, TryClone, Any, Default)]
#[rune(item = ::fieldsModule)]
pub struct BoolField {
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
    pub value: bool,
}
