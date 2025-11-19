# Aeonmi Quantum Workflow Build Script
# Requires: Node.js, Expo CLI, PowerShell 5.1+

param(
    [switch]$Android,
    [switch]$iOS,
    [switch]$Web,
    [switch]$All
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Aeonmi Quantum Workflow Build Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Default to building all if no specific platform specified
if (-not $Android -and -not $iOS -and -not $Web) {
    $All = $true
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build Android
if ($Android -or $All) {
    Write-Host "Building Android APK..." -ForegroundColor Yellow
    try {
        npx expo build:android --type apk
        Write-Host "✓ Android APK build completed" -ForegroundColor Green
        Write-Host "  Download from: https://expo.dev/accounts/[your-account]/projects/aeonmi-quantum-workflow" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Android build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Build iOS (macOS only)
if (($iOS -or $All) -and $IsMacOS) {
    Write-Host "Building iOS Archive..." -ForegroundColor Yellow
    try {
        npx expo build:ios --type archive
        Write-Host "✓ iOS Archive build completed" -ForegroundColor Green
        Write-Host "  Download from: https://expo.dev/accounts/[your-account]/projects/aeonmi-quantum-workflow" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ iOS build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Build Web
if ($Web -or $All) {
    Write-Host "Building web version..." -ForegroundColor Yellow
    try {
        npx expo export --platform web
        Write-Host "✓ Web build completed" -ForegroundColor Green
        Write-Host "  Local preview: npx serve dist" -ForegroundColor Cyan
        Write-Host "  Deploy dist/ folder to web server" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ Web build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Build Electron (Desktop)
if ($All) {
    Write-Host "Building Electron desktop app..." -ForegroundColor Yellow
    try {
        # Check if electron build script exists
        if (Test-Path "electron/build.js") {
            node electron/build.js
            Write-Host "✓ Electron build completed" -ForegroundColor Green
        } else {
            Write-Host "! Electron build script not found, skipping" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ Electron build failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Build Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Project: Aeonmi Quantum Workflow v1.0.0" -ForegroundColor Green
Write-Host "✓ Bundle ID: com.aeonmi.quantumworkflow" -ForegroundColor Green
Write-Host "✓ Theme: Dark Quantum UI" -ForegroundColor Green
Write-Host ""
Write-Host "Downloads:" -ForegroundColor Yellow
Write-Host "  • Android APK: Expo Dashboard" -ForegroundColor White
Write-Host "  • iOS Archive: Expo Dashboard (macOS only)" -ForegroundColor White
Write-Host "  • Web Build: dist/ folder" -ForegroundColor White
Write-Host "  • Desktop: electron/dist/ (if built)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test builds on target devices" -ForegroundColor White
Write-Host "  2. Submit to app stores" -ForegroundColor White
Write-Host "  3. Deploy web version to aeonmi.ai" -ForegroundColor White
Write-Host "  4. Configure backend API endpoints" -ForegroundColor White
Write-Host ""
Write-Host "Ready for quantum deployment! ⚛️" -ForegroundColor Cyan