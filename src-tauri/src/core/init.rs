use std::fs::{self, File};
use std::io::{Error, Write};

use tauri::{App, Emitter};

use super::conf::Group;
use super::constants::{ID_CONFIG_PATH, LIST_PATH};

pub fn create_failed(app: &App, e: Error) {
    app.emit("create_failed", e.to_string())
        .expect("An error occurred in Event.");
}

pub async fn app_init(app: &App) {
    if !ID_CONFIG_PATH.exists()
        || fs::read_to_string(&*ID_CONFIG_PATH)
            .unwrap_or_default()
            .trim()
            .is_empty()
    {
        let default_content = serde_json::to_string::<Vec<Group>>(&vec![]).unwrap();

        if let Err(e) = fs::create_dir_all(ID_CONFIG_PATH.parent().unwrap()) {
            create_failed(app, e);
        } else if let Err(e) = File::create(&*ID_CONFIG_PATH)
            .and_then(|mut file| file.write_all(default_content.as_bytes()))
        {
            create_failed(app, e);
        }
    }

    if !LIST_PATH.exists() {
        if let Err(e) = fs::create_dir_all(&*LIST_PATH) {
            create_failed(app, e);
        }
    }
}
