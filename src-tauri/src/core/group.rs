use crate::err_to_string;

use super::constants::LIST_PATH;
use super::error::AnyHowResult;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct GroupDetail {
    id: u32,
    content: String,
    update_time: i64,
}

#[tauri::command]
pub fn add_group(id: u32) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(File::create(&group_path))?;
    let group_detail: GroupDetail = GroupDetail {
        id,
        content: String::from(""),
        update_time: Utc::now().timestamp(),
    };
    let contents = err_to_string!(serde_json::to_string(&group_detail))?;
    err_to_string!(file.write_all(contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn del_group(id: u32) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    err_to_string!(fs::remove_file(&group_path))?;
    Ok(())
}

#[tauri::command]
pub fn update_group(id: u32, content: String) -> AnyHowResult {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(File::open(&group_path))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let mut group_detail: GroupDetail = err_to_string!(serde_json::from_str(&contents))?;
    group_detail.content = content;
    group_detail.update_time = Utc::now().timestamp();
    let updated_contents = err_to_string!(serde_json::to_string(&group_detail))?;
    err_to_string!(file.write_all(updated_contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn read_group(id: u32) -> AnyHowResult<String> {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = err_to_string!(File::open(&group_path))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let group_detail: GroupDetail = err_to_string!(serde_json::from_str(&contents))?;
    Ok(group_detail.content)
}
