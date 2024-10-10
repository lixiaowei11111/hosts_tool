use anyhow::Result;

pub type AnyHowResult<T = ()> = Result<T, String>;

#[macro_export]
macro_rules! err_to_string {
    ($expr:expr) => {
        $expr.map_err(|e| e.to_string())
    };
}
