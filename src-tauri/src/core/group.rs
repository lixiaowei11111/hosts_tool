use std::fs::{self, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use super::constants::LIST_PATH;
use super::error::AnyHowResult;
use super::util::{get_system_hosts_update_time, read_system_hosts};
use crate::err_to_string;

#[derive(Serialize, Deserialize)]
pub struct GroupDetail {
    pub id: usize,
    pub uuid: Uuid,
    pub content: String,
    pub update_time: i64,
}

pub fn get_system_group_detail() -> AnyHowResult<GroupDetail> {
    let system_hosts_detail = GroupDetail {
        id: 0,
        uuid: Uuid::new_v4(),
        content: read_system_hosts()?,
        update_time: get_system_hosts_update_time()?,
    };
    Ok(system_hosts_detail)
}

#[tauri::command]
pub fn add_group_detail(id: usize, uuid: Uuid) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&group_path))?;

    let group_detail: GroupDetail = GroupDetail {
        id,
        uuid,
        content: String::from(""),
        update_time: Utc::now().timestamp(),
    };

    let contents = err_to_string!(serde_json::to_string(&group_detail))?;
    err_to_string!(file.write_all(contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn del_group_detail(id: usize) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    err_to_string!(fs::remove_file(&group_path))?;
    Ok(())
}

#[tauri::command]
pub fn update_group_content(id: usize, content: String) -> AnyHowResult {
    if id == 0 {
        return Err(String::from("system hosts can not update"));
    }
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&group_path))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let mut group_detail: GroupDetail = err_to_string!(serde_json::from_str(&contents))?;
    group_detail.content = content;
    group_detail.update_time = Utc::now().timestamp();
    let updated_contents = err_to_string!(serde_json::to_string(&group_detail))?;

    err_to_string!(file.seek(SeekFrom::Start(0)))?;
    err_to_string!(file.set_len(0))?;

    err_to_string!(file.write_all(updated_contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn read_group_detail(id: usize) -> AnyHowResult<GroupDetail> {
    if id == 0 {
        return Ok(get_system_group_detail()?);
    }
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    if !group_path.exists() {
        return Err(String::from("id does not exist"));
        // Err(String::from("id does not exist"))
    }
    let mut file = err_to_string!(OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&group_path))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let group_detail: GroupDetail = err_to_string!(serde_json::from_str(&contents))?;
    Ok(group_detail)
}
