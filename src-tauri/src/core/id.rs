use super::conf::read_conf;
use super::error::AnyHowResult;
use crate::err_to_string;
use uuid::Uuid;

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
