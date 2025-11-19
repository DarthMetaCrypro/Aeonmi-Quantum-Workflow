#!/bin/bash

# Aeonmi Quantum Workflow - Installation Script
# Run this script to install the application

echo -e "\033[0;36mInstalling Aeonmi Quantum Workflow...\033[0m"

# Android installation
if [ -f "builds/android/aeonmi-quantum-workflow.apk" ]; then
    echo -e "\033[0;32m📱 To install Android APK:\033[0m"
    echo -e "\033[1;33m1. Enable 'Install from Unknown Sources' in Android settings\033[0m"
    echo -e "\033[1;33m2. Transfer builds/android/aeonmi-quantum-workflow.apk to your Android device\033[0m"
    echo -e "\033[1;33m3. Open the APK file on your device and install\033[0m"
fi

# Web deployment
if [ -d "builds/web" ]; then
    echo -e "\033[0;32m🌐 To deploy web version:\033[0m"
    echo -e "\033[1;33m1. Upload the 'builds/web' folder to your web server\033[0m"
    echo -e "\033[1;33m2. Configure your web server to serve the index.html file\033[0m"
    echo -e "\033[1;33m3. Access the app at your domain\033[0m"
fi

echo -e "\033[0;32m✅ Installation instructions displayed above\033[0m"
