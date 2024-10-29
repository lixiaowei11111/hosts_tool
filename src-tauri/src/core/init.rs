use std::fs::{self, File};
use std::io::{Error, Read, Write};
use std::path::Path;

use chrono::Utc;
use tauri::{App, Emitter};
use uuid::Uuid;

use super::conf::{read_conf, Group, Status};
use super::constants::{END_POSITION, HOSTS_PATH, ID_CONFIG_PATH, LIST_PATH, START_POSITION};
use super::error::AnyHowResult;
use super::group::{add_group_detail, read_group_detail};
use crate::err_to_string;

#[tauri::command]
pub fn read_system_hosts() -> AnyHowResult<String> {
    let hosts = Path::new(HOSTS_PATH);
    let mut contents: String = String::new();
    let mut f = err_to_string!(File::open(hosts))?;
    err_to_string!(f.read_to_string(&mut contents))?;
    Ok(contents)
}

pub fn joint_content() -> AnyHowResult<String> {
    let groups = err_to_string!(read_conf())?;
    let ids_content: Vec<String> = groups
        .into_iter()
        .filter(|g| g.status == Status::ON)
        .filter_map(|g| {
            if let Ok(group_detail) = read_group_detail(g.id) {
                Some(group_detail.content)
            } else {
                None
            }
        })
        .collect();
    Ok(ids_content.join("\n"))
}

#[tauri::command]
pub fn update_system_hosts() -> AnyHowResult {
    let contents = err_to_string!(joint_content())?;
    let system_hosts = err_to_string!(read_system_hosts())?;

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
    let mut file = err_to_string!(File::create(HOSTS_PATH))?;
    err_to_string!(file.write_all(new_hosts.as_bytes()))?;
    Ok(())
}

pub fn create_failed(app: &App, e: Error) {
    app.emit("create_failed", e.to_string())
        .expect("An error occurred in Event.");
}

pub async fn app_init(app: &App) {
    if !ID_CONFIG_PATH.exists()
        || fs::read_to_string(&*ID_CONFIG_PATH)
            .unwrap_or_default()
            .trim()
            .is_empty()
    {
        let uuid = Uuid::new_v4();
        let id = 1usize;
        let default_group = Group {
            id,
            uuid,
            name: String::from("默认"),
            status: Status::ON,
            update_time: Utc::now().timestamp(),
        };
        let default_content = serde_json::to_string(&vec![default_group]).unwrap();

        if let Err(e) = fs::create_dir_all(ID_CONFIG_PATH.parent().unwrap()) {
            create_failed(app, e);
        } else if let Err(e) = File::create(&*ID_CONFIG_PATH).and_then(|mut file| {
            file.write_all(default_content.as_bytes()).and_then(|_| {
                add_group_detail(id, uuid)
                    .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
            })
        }) {
            create_failed(app, e);
        }
    }

    if !LIST_PATH.exists() {
        if let Err(e) = fs::create_dir_all(&*LIST_PATH) {
            create_failed(app, e);
        }
    }
}
