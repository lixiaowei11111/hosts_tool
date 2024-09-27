use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub enum Status {
    ON,
    OFF,
}

#[derive(Serialize, Deserialize)]
pub struct Group {
    pub name: String,
    pub id: u32,
    pub status: Status,
}

pub struct GroupIdList(pub Vec<u32>);

// 添加group
#[tauri::command]
pub fn add_group() {}

// 删除group
#[tauri::command]
pub fn del_group() {}

// 修改group
#[tauri::command]
pub fn update_group() {}

// 查询group
#[tauri::command]
pub fn read_group() {}
