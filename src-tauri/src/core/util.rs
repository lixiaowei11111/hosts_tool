use std::fs::{self, File};
use std::io::{Read, Write};
use std::os::windows::fs::MetadataExt;
use std::path::Path;

use uuid::Uuid;

use super::conf::read_conf;
use super::conf::Status;
use super::constants::{END_POSITION, HOSTS_PATH, START_POSITION};
use super::error::AnyHowResult;
use super::group::read_group_detail;
use crate::err_to_string;

pub fn get_max_id() -> AnyHowResult<usize> {
    let groups = err_to_string!(read_conf())?;
    let ids: Vec<usize> = groups.into_iter().map(|g| g.id).collect();
    Ok(ids.into_iter().max().unwrap_or(0))
}

pub fn generate_id() -> AnyHowResult<usize> {
    let max_id = err_to_string!(get_max_id())?;
    Ok(max_id + 1)
}

pub fn get_id_by_uuid(uuid: Uuid) -> AnyHowResult<Option<usize>> {
    let groups = err_to_string!(read_conf())?;
    let mut id: Option<usize> = None;
    for group in groups {
        if group.uuid == uuid {
            id = Some(group.id);
            break;
        }
    }
    Ok(id)
}

#[tauri::command]
pub fn read_system_hosts() -> AnyHowResult<String> {
    let hosts = Path::new(HOSTS_PATH);
    let mut contents: String = String::new();
    let mut f = err_to_string!(File::open(hosts))?;
    err_to_string!(f.read_to_string(&mut contents))?;
    Ok(contents)
}

pub fn get_system_hosts_update_time() -> AnyHowResult<i64> {
    let hosts_metadata = err_to_string!(fs::metadata(HOSTS_PATH))?;
    let modified: u64 = hosts_metadata.last_write_time();
    Ok(modified as i64)
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
