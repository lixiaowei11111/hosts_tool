use chrono;
use std::fs::{self, File};
use std::io::{Error, Read, Write};
use std::path::Path;
use tauri::{App, Emitter};

use super::conf::{read_conf, Group, Status};
use super::constants::{END_POSITION, HOSTS_PATH, ID_CONFIG_PATH, LIST_PATH, START_POSITION};
use super::group::read_group;

// 读取系统hosts
#[tauri::command]
pub fn read_system_hosts() -> String {
    let hosts = Path::new(HOSTS_PATH);
    let mut contents: String = String::new();
    if let Ok(mut f) = File::open(hosts) {
        f.read_to_string(&mut contents).unwrap();
    };
    contents
}

// 更新系统hosts
// 读取id_list
//根据id_list筛选出Status::ON的group
//将group对应的content提取出来,拼接
pub fn joint_content() -> Option<String> {
    if let Ok(groups) = read_conf() {
        let ids_content: Vec<String> = groups
            .into_iter()
            .filter_map(|g| {
                if g.status == Status::ON {
                    Some(read_group(g.id))
                } else {
                    None
                }
            })
            .collect();
        Some(ids_content.join("\n"))
    } else {
        None
    }
}

// 将 START_POSITION 和 END_POSITION 和contents拼接
// 替换系统hosts中的START_POSITION和END_POSITION的内容,
#[tauri::command]
pub fn update_system_hosts() {
    if let Some(contents) = joint_content() {
        let system_hosts = read_system_hosts();

        let start_index = system_hosts
            .find(START_POSITION)
            .unwrap_or(system_hosts.len());
        let end_index = system_hosts
            .find(END_POSITION)
            .unwrap_or(system_hosts.len());

        let new_hosts = format!(
            "{}\n{}\n{}\n{}",
            &system_hosts[..start_index],
            START_POSITION,
            contents,
            &system_hosts[end_index..]
        );

        if let Ok(mut file) = File::create(HOSTS_PATH) {
            file.write_all(new_hosts.as_bytes())
                .expect("Failed to write to hosts file");
        }
    }
}

// 创建文件/文件夹失败
pub fn create_failed(app: &App, e: Error) {
    app.emit("create_failed", e.to_string())
        .expect("An error occurred in Event.");
}

pub async fn on_app_init(app: &App) {
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
