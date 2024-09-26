pub enum Status {
    ON,
    OFF,
}

pub struct Group {
    name: String,
    id: u32,
    status: Status,
}

pub struct GroupIdList(Vec<i32>);

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
