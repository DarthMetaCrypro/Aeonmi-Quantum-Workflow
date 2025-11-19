@echo off
echo ========================================
echo  Aeonmi Quantum Workflow Build Script
echo ========================================
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building Android APK...
call npx expo build:android --type apk
if %errorlevel% neq 0 (
    echo ERROR: Android build failed
    pause
    exit /b 1
)

echo.
echo Building web version...
call npx expo export --platform web
if %errorlevel% neq 0 (
    echo ERROR: Web build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Build Complete!
echo ========================================
echo.
echo Downloads available at:
echo - Android APK: Check Expo dashboard
echo - Web Build: dist/ folder
echo.
echo To run locally:
echo   npx serve dist
echo.
pause