use crate::err_to_string;

use super::conf::get_max_id;
use super::constants::LIST_PATH;
use super::error::AnyHowResult;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct GroupDetail {
    pub id: usize,
    pub uuid: Uuid,
    pub content: String,
    pub update_time: i64,
}

#[tauri::command]
pub fn add_group() -> AnyHowResult {
    let id = err_to_string!(get_max_id())?;
    let id = id + 1;
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&group_path))?;
    let group_detail: GroupDetail = GroupDetail {
        id,
        uuid: Uuid::new_v4(),
        content: String::from(""),
        update_time: Utc::now().timestamp(),
    };
    let contents = err_to_string!(serde_json::to_string(&group_detail))?;
    err_to_string!(file.write_all(contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn del_group(uuid: usize) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    err_to_string!(fs::remove_file(&group_path))?;
    Ok(())
}

#[tauri::command]
pub fn update_group_content(id: usize, content: String) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(&group_path))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let mut group_detail: GroupDetail = err_to_string!(serde_json::from_str(&contents))?;
    group_detail.id = id;
    group_detail.content = content;
    group_detail.update_time = Utc::now().timestamp();
    let updated_contents = err_to_string!(serde_json::to_string(&group_detail))?;

    err_to_string!(file.seek(SeekFrom::Start(0)))?;
    err_to_string!(file.set_len(0))?;

    err_to_string!(file.write_all(updated_contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn read_group(id: usize) -> AnyHowResult<GroupDetail> {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    if !group_path.exists() {
        err_to_string!(add_group(id))?;
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
