use super::constants::ID_CONFIG_PATH;
use super::error::AnyHowResult;
use crate::err_to_string;
use anyhow::Ok;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{Read, Write};
use std::vec::Vec;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum Status {
    ON,
    OFF,
    DELETE,
}

#[derive(Serialize, Deserialize)]
pub struct Group {
    pub name: String,
    pub id: usize,
    pub uuid: Uuid,
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
pub fn update_group_status(uuid: Uuid, status: Status) -> AnyHowResult {
    let mut groups = err_to_string!(read_conf())?;
    use chrono::Utc;
    for group in &mut groups {
        if group.uuid.eq(&uuid) {
            group.status = status;
            group.update_time = Utc::now().timestamp();
            break;
        }
    }
    err_to_string!(update_conf(groups))?;
    Ok(())
}

#[tauri::command]
pub fn del_single_group(uuid: Uuid) -> AnyHowResult {
    let groups = err_to_string!(read_conf())?;
    use chrono::Utc;
    let groups = groups
        .into_iter()
        .filter_map(|mut g| {
            if g.uuid.eq(&uuid) {
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

pub fn add_single_group(name: String) -> AnyHowResult {
    let groups = err_to_string!(read_conf())?;
    let uuid = Uuid::new_v4();
    Ok(())
}

pub fn get_max_id() -> AnyHowResult<usize> {
    let mut groups = err_to_string!(read_conf())?;
    let ids: Vec<usize> = groups.into_iter().map(|g| g.id).collect();
    let max = ids.into_iter().max().unwrap_or(0usize);
    Ok(max);
}

// pub fn get_id_by_uuid(uuid: usize) -> AnyHowResult<Option<Uuid>> {
//     let groups = err_to_string!(read_conf())?;
// }
