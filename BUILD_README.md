# Aeonmi Quantum Workflow - Build Scripts

## Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

## Build Commands

### Android APK Build
```bash
# Install dependencies
npm install

# Configure for production
expo install expo-build-properties

# Build APK
npx expo build:android --type apk

# Or for app bundle (recommended for Play Store)
npx expo build:android --type app-bundle
```

### iOS Build (macOS only)
```bash
# Install dependencies
npm install

# Configure for production
expo install expo-build-properties

# Build IPA
npx expo build:ios --type archive
```

### Web Build
```bash
# Build for web deployment
npx expo export --platform web

# Serve locally
npx serve dist
```

## Build Configuration

### app.json Settings
- **Bundle Identifier**: com.aeonmi.quantumworkflow
- **Package Name**: com.aeonmi.quantumworkflow
- **Version**: 1.0.0
- **Orientation**: Portrait
- **Theme**: Dark

### Required Assets
- `assets/icon.png` (1024x1024) - App icon
- `assets/adaptive-icon.png` (1024x1024) - Android adaptive icon
- `assets/splash.png` (2048x2048) - Splash screen
- `assets/favicon.png` (32x32) - Web favicon

## Distribution

### Android
1. Download APK from Expo build service
2. Test on Android device
3. Upload to Google Play Store
4. Or distribute APK directly to users

### iOS
1. Download IPA from Expo build service
2. Use Xcode to upload to App Store
3. Or distribute via TestFlight/Ad Hoc

### Web
1. Deploy `dist/` folder to web server
2. Configure domain (aeonmi.ai recommended)
3. Enable HTTPS for security

## Build Scripts

### Quick Build Script (build.bat)
```batch
@echo off
echo Building Aeonmi Quantum Workflow...

# Install dependencies
call npm install

# Build for Android
echo Building Android APK...
call npx expo build:android --type apk

# Build for web
echo Building web version...
call npx expo export --platform web

echo Build complete! Check dist/ and Expo dashboard for downloads.
```

### Automated Build (build.ps1)
```powershell
# Aeonmi Quantum Workflow Build Script
Write-Host "Building Aeonmi Quantum Workflow..." -ForegroundColor Cyan

# Install dependencies
npm install

# Build Android APK
Write-Host "Building Android APK..." -ForegroundColor Yellow
npx expo build:android --type apk

# Build iOS (if on macOS)
if ($IsMacOS) {
    Write-Host "Building iOS Archive..." -ForegroundColor Yellow
    npx expo build:ios --type archive
}

# Build web version
Write-Host "Building web version..." -ForegroundColor Yellow
npx expo export --platform web

Write-Host "Build complete! Check dist/ and Expo dashboard." -ForegroundColor Green
```