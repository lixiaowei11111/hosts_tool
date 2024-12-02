use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use std::string::String;
use std::time::UNIX_EPOCH;

use uuid::Uuid;

use super::conf::read_conf;
use super::conf::Status;
use super::constants::{END_POSITION, HOSTS_PATH, START_POSITION, TEST_HOSTS_PATH};
use super::error::AnyHowResult;
use super::group::read_group_detail;
use crate::err_to_string;

pub fn get_max_id() -> AnyHowResult<usize> {
    let groups = read_conf(false)?;
    let ids: Vec<usize> = groups.into_iter().map(|g| g.id).collect();
    Ok(ids.into_iter().max().unwrap_or(0))
}

pub fn generate_id() -> AnyHowResult<usize> {
    let max_id = get_max_id()?;
    Ok(max_id + 1)
}

#[allow(dead_code)]
pub fn get_id_by_uuid(uuid: Uuid) -> AnyHowResult<Option<usize>> {
    let groups = read_conf(false)?;
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
    let modified = err_to_string!(hosts_metadata.modified())?;
    let duration = err_to_string!(modified.duration_since(UNIX_EPOCH))?;
    Ok(duration.as_secs() as i64)
}

pub fn joint_content() -> AnyHowResult<String> {
    let groups = read_conf(false)?;
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
    let contents = joint_content()?;
    let system_hosts = read_system_hosts()?;

    let start_index = system_hosts
        .find(START_POSITION)
        .unwrap_or(system_hosts.len());
    let end_index = system_hosts
        .find(END_POSITION)
        .unwrap_or(system_hosts.len());

    let new_hosts = format!(
        "{}\n\n{}\n\n{}\n\n{}\n\n{}",
        &system_hosts[..start_index],
        START_POSITION,
        contents,
        END_POSITION,
        &system_hosts[end_index..],
    );
    let mut file = err_to_string!(File::create(TEST_HOSTS_PATH))?;
    err_to_string!(file.write_all(new_hosts.as_bytes()))?;
    Ok(())
}
