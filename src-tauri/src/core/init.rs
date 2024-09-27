use super::constants::CONFIG_PATH;
use super::group::{Group, Status};

use std::fs;
use std::io::Error;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::vec;
use tauri::{App, Emitter};

// 读取系统hosts
pub fn read_system_hosts() {}

// 更新系统hosts
pub fn update_system_hosts() {}

// 判断配置文件路径是否存在
pub fn exist_config_path(path: &PathBuf) -> bool {
    Path::new(&path).exists()
}

// 创建文件/文件夹失败
pub fn create_failed(app: &mut App, e: Error) {
    app.emit("create_failed", e.to_string())
        .expect("An error occurred in Event.");
}

pub async fn on_app_init(app: &mut App) {
    let id_list_file = CONFIG_PATH.join("data").join("id_list.json");
    if !id_list_file.exists()
        || fs::read_to_string(&id_list_file)
            .unwrap_or_default()
            .trim()
            .is_empty()
    {
        let default_group = Group {
            id: 0,
            name: "default_group".to_string(),
            status: Status::ON,
        };
        let default_content = serde_json::to_string(&vec![default_group]).unwrap();

        match fs::create_dir_all(id_list_file.parent().unwrap()) {
            Ok(_) => match fs::File::create(&id_list_file) {
                Ok(mut file) => {
                    file.write_all(default_content.as_bytes()).unwrap();
                }
                Err(e) => {
                    create_failed(app, e);
                }
            },
            Err(e) => {
                create_failed(app, e);
            }
        }
    }
}
