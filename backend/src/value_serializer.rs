use rune::{FromValue, alloc::clone::TryClone, runtime::Value};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, FromValue, TryClone)]
pub struct SValue(pub Value);

impl rune::ToValue for SValue {
    #[inline]
    fn to_value(self) -> Result<Value, rune::runtime::RuntimeError> {
        <Value as rune::ToValue>::to_value(self.0)
    }
}
