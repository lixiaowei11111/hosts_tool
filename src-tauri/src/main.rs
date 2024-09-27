// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
mod core;

use core::{conf, group, init};
fn main() {
    tauri::Builder::default()
        .setup(|app| {
            tauri::async_runtime::block_on(async move {
                init::on_app_init(app).await;
            });
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            group::add_group,
            group::del_group,
            group::update_group,
            group::read_group,
            conf::read_conf,
            conf::save_conf,
            conf::update_conf,
            conf::get_conf_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
