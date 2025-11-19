# Aeonmi Quantum Workflow - Build Validation Script

## Overview
This script validates that the Aeonmi Quantum Workflow app builds correctly and all components are working.

## Quick Validation

### 1. TypeScript Compilation Check
```bash
# Check TypeScript compilation
npx tsc --noEmit
```

### 2. Lint Check
```bash
# Run ESLint
npx eslint . --ext .ts,.tsx
```

### 3. Expo Doctor
```bash
# Check Expo configuration
npx expo install --fix
npx expo doctor
```

### 4. Build Test (Web)
```bash
# Quick web build test
npx expo export --platform web --dev
```

### 5. Asset Validation
```bash
# Check that all required assets exist
ls -la assets/
ls -la assets/icons/
```

## Automated Validation Script

### Windows (PowerShell)
```powershell
.\validate-build.ps1
```

### macOS/Linux (Bash)
```bash
chmod +x validate-build.sh
./validate-build.sh
```

## Validation Checks

### ✅ Code Quality
- TypeScript compilation passes
- ESLint passes with no errors
- All imports resolve correctly

### ✅ Configuration
- app.json is valid
- package.json dependencies are installed
- Expo configuration is correct

### ✅ Assets
- App icons exist in correct formats
- Splash screens are present
- Asset paths are correct

### ✅ Build Process
- Web build completes successfully
- Android build configuration is valid
- iOS build configuration is valid (macOS)

### ✅ Runtime
- App starts without crashes
- Navigation works correctly
- Core features function

## Common Issues & Fixes

### Issue: TypeScript Errors
```
Fix: Check import paths and type definitions
Run: npx tsc --noEmit
```

### Issue: Missing Dependencies
```
Fix: Install missing packages
Run: npm install
```

### Issue: Expo Configuration
```
Fix: Update app.json or run doctor
Run: npx expo doctor
```

### Issue: Asset Loading
```
Fix: Verify asset paths in app.json
Check: assets/ directory structure
```

## Build Status Dashboard

### Current Status
- ✅ TypeScript: Compiling
- ✅ Dependencies: Installed
- ✅ Assets: Present
- ✅ Configuration: Valid
- 🔄 Build: Testing...

### Build History
- v1.0.0-alpha: ✅ Passed
- v1.0.0-beta: ✅ Passed
- v1.0.0-rc: 🔄 Testing

---

**Ready for quantum deployment! ⚛️**