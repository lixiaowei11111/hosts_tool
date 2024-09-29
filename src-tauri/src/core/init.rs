use chrono;
use std::fs::{self, File};
use std::io::{Error, Write};
use std::path::Path;
use tauri::{App, Emitter};

use super::conf::{Group, Status};
use super::constants::{END_POSITION, HOSTS_PATH, ID_CONFIG_PATH, LIST_PATH, START_POSITION};

// 读取系统hosts
pub fn read_system_hosts() -> Result<File, Error> {
    let hosts = Path::new(HOSTS_PATH);
    match File::open(hosts) {
        Ok(f) => Ok(f),
        Err(e) => Err(e),
    }
}

// 更新系统hosts
pub fn update_system_hosts() {
    let mut id_list = File::open(&*ID_CONFIG_PATH).expect("open id_list failed");
    let end_flag = END_POSITION;
    let start_flag = START_POSITION;
}

// 创建文件/文件夹失败
pub fn create_failed(app: &mut App, e: Error) {
    app.emit("create_failed", e.to_string())
        .expect("An error occurred in Event.");
}

pub async fn on_app_init(app: &mut App) {
    if !ID_CONFIG_PATH.exists()
        || fs::read_to_string(&*ID_CONFIG_PATH)
            .unwrap_or_default()
            .trim()
            .is_empty()
    {
        let default_group = Group {
            id: 0,
            name: "default_group".to_string(),
            status: Status::ON,
            update_time: chrono::Utc::now().timestamp(),
        };
        let default_content = serde_json::to_string(&vec![default_group]).unwrap();

        if let Err(e) = fs::create_dir_all(ID_CONFIG_PATH.parent().unwrap()) {
            create_failed(app, e);
        } else if let Err(e) = File::create(&*ID_CONFIG_PATH)
            .and_then(|mut file| file.write_all(default_content.as_bytes()))
        {
            create_failed(app, e);
        }
    }

    if !LIST_PATH.exists() {
        if let Err(e) = fs::create_dir_all(&*LIST_PATH) {
            create_failed(app, e);
        }
    }
}
