pub const WIN_HOSTS_PATH: &str = r#"C:\Windows\System32\drivers\etc\hosts"#;

pub fn get_home_dir() -> String {
    use dirs::home_dir;
    let mut default_home_dir = String::from("./.mini-hosts");
    if let Some(home_dir) = home_dir() {
        default_home_dir = home_dir.to_str().unwrap().to_string();
    };
    default_home_dir
}
