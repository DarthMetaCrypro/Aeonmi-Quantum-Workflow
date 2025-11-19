param(
    [switch]$Android,
    [switch]$iOS,
    [switch]$Web,
    [switch]$Desktop,
    [switch]$All,
    [switch]$Package,
    [switch]$Clean,
    [string]$Version = "1.0.0"
)

# Aeonmi Quantum Workflow - Complete Build & Deployment Script
# This script builds and packages the Aeonmi Quantum Workflow app for all platforms

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BuildDir = Join-Path $ProjectRoot "builds"
$AssetsDir = Join-Path $ProjectRoot "assets"
$PackageName = "Aeonmi-Quantum-Workflow-v$Version"

Write-Host "🚀 Aeonmi Quantum Workflow - Build & Deployment Script" -ForegroundColor Cyan
Write-Host "Version: $Version" -ForegroundColor Yellow
Write-Host "Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to run command with error handling
function Invoke-BuildCommand {
    param([string]$Command, [string]$Description)
    Write-Host "🔧 $Description..." -ForegroundColor Green
    try {
        Invoke-Expression $Command
        Write-Host "✅ $Description completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ $Description failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}
}

# Clean build directory
if ($Clean) {
    Write-Host "🧹 Cleaning build directory..." -ForegroundColor Yellow
    if (Test-Path $BuildDir) {
        Remove-Item $BuildDir -Recurse -Force
    }
    Write-Host "✅ Build directory cleaned" -ForegroundColor Green
}

# Create build directories
New-Item -ItemType Directory -Force -Path $BuildDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BuildDir "android") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BuildDir "ios") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BuildDir "web") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $BuildDir "desktop") | Out-Null

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

$Prerequisites = @(
    @{Name = "node"; Command = "node --version"},
    @{Name = "npm"; Command = "npm --version"},
    @{Name = "expo"; Command = "npx expo --version"}
)

foreach ($prereq in $Prerequisites) {
    if (Test-Command $prereq.Name) {
        $version = Invoke-Expression $prereq.Command 2>$null
        Write-Host "✅ $($prereq.Name): $version" -ForegroundColor Green
    } else {
        Write-Host "❌ $($prereq.Name) not found. Please install $($prereq.Name)." -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Invoke-BuildCommand "npm install" "Installing npm dependencies"

# Build Android
if ($Android -or $All) {
    Write-Host "🤖 Building Android APK..." -ForegroundColor Blue
    Invoke-BuildCommand "npx expo build:android --type apk --output (Join-Path $BuildDir 'android\aeonmi-quantum-workflow.apk')" "Building Android APK"

    Write-Host "🤖 Building Android App Bundle..." -ForegroundColor Blue
    Invoke-BuildCommand "npx expo build:android --type app-bundle --output (Join-Path $BuildDir 'android\aeonmi-quantum-workflow.aab')" "Building Android App Bundle"
}

# Build iOS (macOS only)
if ($iOS -or $All) {
    if ($env:OS -eq "Windows_NT") {
        Write-Host "⚠️ iOS builds are only supported on macOS" -ForegroundColor Yellow
    } else {
        Write-Host "🍎 Building iOS Archive..." -ForegroundColor Blue
        Invoke-BuildCommand "npx expo build:ios --type archive --output (Join-Path $BuildDir 'ios\AeonmiQuantumWorkflow.xcarchive')" "Building iOS Archive"
    }
}

# Build Web
if ($Web -or $All) {
    Write-Host "🌐 Building Web version..." -ForegroundColor Blue
    Invoke-BuildCommand "npx expo export --platform web --output-dir (Join-Path $BuildDir 'web')" "Exporting Web build"
}

# Build Desktop (Electron)
if ($Desktop -or $All) {
    Write-Host "💻 Building Desktop version..." -ForegroundColor Blue
    if (Test-Path "electron") {
        Set-Location electron
        Invoke-BuildCommand "npm install" "Installing Electron dependencies"
        Invoke-BuildCommand "npm run build" "Building Electron app"
        Copy-Item "dist" (Join-Path $BuildDir "desktop") -Recurse -Force
        Set-Location $ProjectRoot
    } else {
        Write-Host "⚠️ Electron directory not found, skipping desktop build" -ForegroundColor Yellow
    }
}

# Package everything
if ($Package -or $All) {
    Write-Host "📦 Creating deployment package..." -ForegroundColor Magenta

    $PackageDir = Join-Path $ProjectRoot $PackageName
    New-Item -ItemType Directory -Force -Path $PackageDir | Out-Null

    # Copy builds
    Copy-Item $BuildDir $PackageDir -Recurse -Force

    # Copy assets
    if (Test-Path $AssetsDir) {
        Copy-Item $AssetsDir $PackageDir -Recurse -Force
    }

    # Copy documentation
    $Docs = @("README.md", "DEPLOYMENT_PACKAGE_README.md", "package.json", "app.json")
    foreach ($doc in $Docs) {
        if (Test-Path $doc) {
            Copy-Item $doc $PackageDir
        }
    }

    # Create install scripts
    $InstallScript = @"
# Aeonmi Quantum Workflow - Installation Script
# Run this script to install the application

Write-Host "Installing Aeonmi Quantum Workflow..." -ForegroundColor Cyan

# Android installation
if (Test-Path "builds\android\aeonmi-quantum-workflow.apk") {
    Write-Host "📱 To install Android APK:" -ForegroundColor Green
    Write-Host "1. Enable 'Install from Unknown Sources' in Android settings" -ForegroundColor Yellow
    Write-Host "2. Transfer builds\android\aeonmi-quantum-workflow.apk to your Android device" -ForegroundColor Yellow
    Write-Host "3. Open the APK file on your device and install" -ForegroundColor Yellow
}

# Web deployment
if (Test-Path "builds\web") {
    Write-Host "🌐 To deploy web version:" -ForegroundColor Green
    Write-Host "1. Upload the 'builds\web' folder to your web server" -ForegroundColor Yellow
    Write-Host "2. Configure your web server to serve the index.html file" -ForegroundColor Yellow
    Write-Host "3. Access the app at your domain" -ForegroundColor Yellow
}

Write-Host "✅ Installation instructions displayed above" -ForegroundColor Green
"@

    $InstallScript | Out-File (Join-Path $PackageDir "install.ps1") -Encoding UTF8

    # Create ZIP archive
    $ZipPath = Join-Path $ProjectRoot "$PackageName.zip"
    if (Test-Path $ZipPath) {
        Remove-Item $ZipPath -Force
    }

    Add-Type -AssemblyName "System.IO.Compression.FileSystem"
    [System.IO.Compression.ZipFile]::CreateFromDirectory($PackageDir, $ZipPath)

    Write-Host "📦 Package created: $ZipPath" -ForegroundColor Green
    Write-Host "📦 Package directory: $PackageDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Build and packaging completed successfully!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the builds on target devices/emulators" -ForegroundColor White
Write-Host "2. Submit to app stores (Google Play, Apple App Store)" -ForegroundColor White
Write-Host "3. Deploy web version to hosting service" -ForegroundColor White
Write-Host "4. Distribute the $PackageName.zip package" -ForegroundColor White
Write-Host ""
Write-Host "⚛️ Aeonmi Quantum Workflow - Ready for deployment! 🚀" -ForegroundColor Magenta