#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod bb84;

use bb84::{BB84Protocol, KeyGenerationResult};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct QuantumKeyRequest {
    key_length: usize,
    with_eavesdropper: bool,
    eve_intercept_rate: Option<f64>,
}

#[derive(Serialize)]
struct QuantumStatus {
    active: bool,
    protocol: String,
    version: String,
    ready: bool,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_quantum_status() -> Result<QuantumStatus, String> {
    Ok(QuantumStatus {
        active: true,
        protocol: "BB84".to_string(),
        version: "1.0.0".to_string(),
        ready: true,
    })
}

#[tauri::command]
fn generate_quantum_key(request: QuantumKeyRequest) -> Result<KeyGenerationResult, String> {
    let protocol = BB84Protocol::new(request.key_length);

    let result = if request.with_eavesdropper {
        let intercept_rate = request.eve_intercept_rate.unwrap_or(0.3);
        protocol.generate_key_with_eve(intercept_rate)
    } else {
        protocol.generate_key()
    };

    Ok(result)
}

#[tauri::command]
fn generate_secure_key(key_length: usize) -> Result<KeyGenerationResult, String> {
    let protocol = BB84Protocol::new(key_length);
    Ok(protocol.generate_key())
}

#[tauri::command]
fn test_eavesdropping_detection(
    key_length: usize,
    eve_intercept_rate: f64,
) -> Result<KeyGenerationResult, String> {
    let protocol = BB84Protocol::new(key_length);
    Ok(protocol.generate_key_with_eve(eve_intercept_rate))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            get_quantum_status,
            generate_quantum_key,
            generate_secure_key,
            test_eavesdropping_detection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}