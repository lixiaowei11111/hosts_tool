use super::constants::ID_CONFIG_PATH;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{self, Read, Write};
use std::vec::Vec;
use tauri::ipc::InvokeError;
use thiserror::Error;

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

#[derive(Error, Debug)]
pub enum ReadConfError {
    #[error("Failed to open config file: {0}")]
    OpenFile(#[from] io::Error),

    #[error("Failed to parse config file: {0}")]
    ParseConfig(#[from] serde_json::Error),
}

impl Into<InvokeError> for ReadConfError {
    fn into(self) -> InvokeError {
        InvokeError::from_anyhow(self.into())
    }
}

#[derive(Error, Debug)]
pub enum WriteConfError {
    #[error("Failed to open config file: {0}")]
    OpenFile(#[from] io::Error),

    #[error("Failed to parse config file: {0}")]
    ParseConfig(#[from] serde_json::Error),
}

impl Into<InvokeError> for WriteConfError {
    fn into(self) -> InvokeError {
        InvokeError::from_anyhow(self.into())
    }
}

#[tauri::command]
pub fn read_conf() -> Result<Vec<Group>, ReadConfError> {
    let mut file = File::open(&*ID_CONFIG_PATH)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let groups: Vec<Group> = serde_json::from_str(&contents)?;
    Ok(groups)
}

#[tauri::command]
pub fn update_conf(groups: Vec<Group>) -> Result<(), WriteConfError> {
    let contents = serde_json::to_string(&groups)?;
    let mut file = File::open(&*ID_CONFIG_PATH)?;
    file.write_all(contents.as_bytes())?;
    Ok(())
}

#[tauri::command]
pub fn update_group_status(id: u32, status: Status) {
    if let Ok(mut groups) = read_conf() {
        use chrono::Utc;
        for group in &mut groups {
            if group.id == id {
                group.status = status;
                group.update_time = Utc::now().timestamp();
                break;
            }
        }
        update_conf(groups).expect("update single group failed");
    }
}

#[tauri::command]
pub fn del_single_group(id: u32) {
    if let Ok(groups) = read_conf() {
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
        update_conf(groups).expect("update single group failed");
    }
}
