use super::constants::ID_CONFIG_PATH;
use super::error::AnyHowResult;
use crate::err_to_string;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Write};
use std::vec::Vec;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum Status {
    ON,
    OFF,
    DELETE,
}

#[derive(Serialize, Deserialize)]
pub struct Group {
    pub name: String,
    pub id: u32,
    pub status: Status,
    pub update_time: i64,
}
type GroupList = Vec<Group>;

#[tauri::command]
pub fn read_conf() -> AnyHowResult<GroupList> {
    let mut file = err_to_string!(File::open(&*ID_CONFIG_PATH))?;
    let mut contents = String::new();
    err_to_string!(file.read_to_string(&mut contents))?;
    let groups: GroupList = err_to_string!(serde_json::from_str(&contents))?;
    Ok(groups)
}

#[tauri::command]
pub fn update_conf(groups: Vec<Group>) -> AnyHowResult {
    let contents = err_to_string!(serde_json::to_string(&groups))?;
    let mut file = err_to_string!(File::create(&*ID_CONFIG_PATH))?;
    err_to_string!(file.write_all(contents.as_bytes()))?;
    Ok(())
}

#[tauri::command]
pub fn update_group_status(id: u32, status: Status) -> AnyHowResult {
    let mut groups = err_to_string!(read_conf())?;
    use chrono::Utc;
    for group in &mut groups {
        if group.id == id {
            group.status = status;
            group.update_time = Utc::now().timestamp();
            break;
        }
    }
    err_to_string!(update_conf(groups))?;
    Ok(())
}

#[tauri::command]
pub fn del_single_group(id: u32) -> AnyHowResult {
    let groups = err_to_string!(read_conf())?;
    use chrono::Utc;
    let groups = groups
        .into_iter()
        .filter_map(|mut g| {
            if g.id == id {
                // completely erase
                if g.status == Status::DELETE {
                    None
                } else {
                    // to bin
                    g.status = Status::DELETE;
                    g.update_time = Utc::now().timestamp();
                    Some(g)
                }
            } else {
                Some(g)
            }
        })
        .collect();
    err_to_string!(update_conf(groups))?;
    Ok(())
}
