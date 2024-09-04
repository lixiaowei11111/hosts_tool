// 读取配置文件
#[tauri::command]
pub fn read_conf() {}

// 保存配置文件
#[tauri::command]
pub fn save_conf() {}

// 更新配置文件
#[tauri::command]
pub fn update_conf() {}

// 获取配置文件路径,有默认路径
#[tauri::command]
pub fn get_conf_path() {}

// 设置配置文件路径
#[tauri::command]
pub fn set_conf_path() {}
