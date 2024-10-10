use super::core::init;
use tauri::{App, Manager};
use window_vibrancy::{self};
/// setup
pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
    tauri::async_runtime::block_on(async {
        init::app_init(&app).await;
    });
    let win = (&app).get_webview_window("main").unwrap();

    #[cfg(target_os = "macos")]
    {
        use window_vibrancy::NSVisualEffectMaterial;
        window_vibrancy::apply_vibrancy(&win, NSVisualEffectMaterial::FullScreenUI)
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
    }

    #[cfg(target_os = "windows")]
    window_vibrancy::apply_blur(&win, Some((18, 18, 18, 64)))
        .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

    Ok(())
}
