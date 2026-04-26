use sqlx::{FromRow, Row, postgres::PgRow};

use crate::form_types::FormField;

impl<'a> FromRow<'a, PgRow> for FormField {
    fn from_row(row: &'a PgRow) -> Result<Self, sqlx::Error> {
        let id: i32 = row.try_get("id")?;

        let field_type: &str = row.try_get("field_type")?;
        let name: &str = row.try_get("name")?;
        let x: i32 = row.try_get("x")?;
        let y: i32 = row.try_get("y")?;
        let new_row = Self::new(x, y, field_type, name);
        match new_row {
            Self::Text(mut txt_field) => {
                txt_field.label = row.try_get("label")?;
                txt_field.placeholder = row.try_get("placeholder").ok();
                txt_field.required = row.try_get("required")?;
                txt_field.enabled = row.try_get("enabled")?;
                txt_field.visible = row.try_get("visible")?;
                Ok(Self::Text(txt_field))
            }
            Self::Int(mut int_field) => {
                int_field.label = row.try_get("label")?;
                int_field.placeholder = row.try_get("placeholder").ok();
                int_field.required = row.try_get("required")?;
                int_field.enabled = row.try_get("enabled")?;
                int_field.visible = row.try_get("visible")?;
                Ok(Self::Int(int_field))
            }
            Self::Decimal(mut decimal_field) => {
                decimal_field.label = row.try_get("label")?;
                decimal_field.placeholder = row.try_get("placeholder").ok();
                decimal_field.required = row.try_get("required")?;
                decimal_field.enabled = row.try_get("enabled")?;
                decimal_field.visible = row.try_get("visible")?;
                Ok(Self::Decimal(decimal_field))
            }
            Self::Bool(mut bool_field) => {
                bool_field.label = row.try_get("label")?;
                bool_field.placeholder = row.try_get("placeholder").ok();
                bool_field.required = row.try_get("required")?;
                bool_field.enabled = row.try_get("enabled")?;
                bool_field.visible = row.try_get("visible")?;
                Ok(Self::Bool(bool_field))
            }

            Self::Raw(mut raw_field) => {
                raw_field.label = row.try_get("label")?;
                raw_field.placeholder = row.try_get("placeholder").ok();
                raw_field.required = row.try_get("required")?;
                raw_field.enabled = row.try_get("enabled")?;
                raw_field.visible = row.try_get("visible")?;
                Ok(Self::Raw(raw_field))
            }
        }
    }
}
