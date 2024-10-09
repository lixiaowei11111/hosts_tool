use super::constants::LIST_PATH;
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
pub fn add_group(id: u32) {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = File::create(&group_path).expect("Failed to create group file");
    let group_detail: GroupDetail = GroupDetail {
        id,
        content: String::from(""),
        update_time: Utc::now().timestamp(),
    };
    let contents = serde_json::to_string(&group_detail).unwrap();
    file.write_all(contents.as_bytes())
        .expect("Failed to write group file");
}

#[tauri::command]
pub fn del_group(id: u32) {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    fs::remove_file(&group_path).expect("Failed to remove group file");
}

#[tauri::command]
pub fn update_group(id: u32, content: String) {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = File::open(&group_path).expect("Failed to open group file");
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .expect("Failed to read group file");
    let mut group_detail: GroupDetail = serde_json::from_str(&contents).unwrap();
    group_detail.content = content;
    group_detail.update_time = Utc::now().timestamp();
    let updated_contents = serde_json::to_string(&group_detail).unwrap();
    file.write_all(updated_contents.as_bytes())
        .expect("Failed to update group file");
}

#[tauri::command]
pub fn read_group(id: u32) -> String {
    let group_path: PathBuf = (&*LIST_PATH).join(id.to_string());
    let mut file = File::open(&group_path).expect("Failed to open group file");
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .expect("Failed to read group file");
    let group_detail: GroupDetail = serde_json::from_str(&contents).unwrap();
    group_detail.content
}
