use dirs;
use lazy_static::lazy_static;
use std::path::PathBuf;
pub const WIN_HOSTS_PATH: &str = r#"C:\Windows\System32\drivers\etc\hosts"#;
pub const START_POSITION: &str = r#"# -- MINI_HOSTS_START"#;

lazy_static! {
    pub static ref CONFIG_PATH: PathBuf = {
        let mut home = dirs::home_dir().expect("Failure to obtain the user's home directory");
        home.push(".mini_hosts");
        home
    };
}
