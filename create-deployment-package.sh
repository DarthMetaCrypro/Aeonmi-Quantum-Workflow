#!/bin/bash

# Aeonmi Quantum Workflow - Complete Build & Deployment Script (Bash)
# This script builds and packages the Aeonmi Quantum Workflow app for all platforms

set -e

# Configuration
VERSION="1.0.0"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$PROJECT_ROOT/builds"
ASSETS_DIR="$PROJECT_ROOT/assets"
PACKAGE_NAME="Aeonmi-Quantum-Workflow-v$VERSION"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Aeonmi Quantum Workflow - Build & Deployment Script${NC}"
echo -e "${YELLOW}Version: $VERSION${NC}"
echo -e "${YELLOW}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Parse command line arguments
ANDROID=false
IOS=false
WEB=false
DESKTOP=false
ALL=false
PACKAGE=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --android) ANDROID=true ;;
        --ios) IOS=true ;;
        --web) WEB=true ;;
        --desktop) DESKTOP=true ;;
        --all) ALL=true ;;
        --package) PACKAGE=true ;;
        --clean) CLEAN=true ;;
        --version) VERSION="$2"; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local desc="$2"
    echo -e "${GREEN}🔧 $desc...${NC}"
    if eval "$cmd"; then
        echo -e "${GREEN}✅ $desc completed successfully${NC}"
    else
        echo -e "${RED}❌ $desc failed${NC}"
        exit 1
    fi
}

# Clean build directory
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}🧹 Cleaning build directory...${NC}"
    rm -rf "$BUILD_DIR"
    echo -e "${GREEN}✅ Build directory cleaned${NC}"
fi

# Create build directories
mkdir -p "$BUILD_DIR/android"
mkdir -p "$BUILD_DIR/ios"
mkdir -p "$BUILD_DIR/web"
mkdir -p "$BUILD_DIR/desktop"

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

check_prereq() {
    local name="$1"
    local cmd="$2"
    if command_exists "$name"; then
        local version
        version=$(eval "$cmd" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ $name: $version${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $name not found, but continuing${NC}"
        return 1
    fi
}

check_prereq "node" "node --version" || true
check_prereq "npm" "npm --version" || true
check_prereq "expo" "npx expo --version" || true

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
run_command "npm install" "Installing npm dependencies"

# Build Android
if [ "$ANDROID" = true ] || [ "$ALL" = true ]; then
    echo -e "${BLUE}🤖 Building Android APK...${NC}"
    run_command "npx expo build:android --type apk --output \"$BUILD_DIR/android/aeonmi-quantum-workflow.apk\"" "Building Android APK"

    echo -e "${BLUE}🤖 Building Android App Bundle...${NC}"
    run_command "npx expo build:android --type app-bundle --output \"$BUILD_DIR/android/aeonmi-quantum-workflow.aab\"" "Building Android App Bundle"
fi

# Build iOS (macOS only)
if [ "$IOS" = true ] || [ "$ALL" = true ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${BLUE}🍎 Building iOS Archive...${NC}"
        run_command "npx expo build:ios --type archive --output \"$BUILD_DIR/ios/AeonmiQuantumWorkflow.xcarchive\"" "Building iOS Archive"
    else
        echo -e "${YELLOW}⚠️ iOS builds are only supported on macOS${NC}"
    fi
fi

# Build Web
if [ "$WEB" = true ] || [ "$ALL" = true ]; then
    echo -e "${BLUE}🌐 Building Web version...${NC}"
    if [ -d "$BUILD_DIR/web" ] && [ -f "$BUILD_DIR/web/index.html" ]; then
        echo -e "${YELLOW}⚠️ Web build already exists, skipping${NC}"
    else
        run_command "npx expo export --platform web --output-dir \"$BUILD_DIR/web\"" "Exporting Web build"
    fi
fi

# Build Desktop (Electron)
if [ "$DESKTOP" = true ] || [ "$ALL" = true ]; then
    echo -e "${BLUE}💻 Building Desktop version...${NC}"
    if [ -d "electron" ]; then
        cd electron
        run_command "npm install" "Installing Electron dependencies"
        run_command "npm run build" "Building Electron app"
        cp -r dist "$BUILD_DIR/desktop/"
        cd "$PROJECT_ROOT"
    else
        echo -e "${YELLOW}⚠️ Electron directory not found, skipping desktop build${NC}"
    fi
fi

# Package everything
if [ "$PACKAGE" = true ] || [ "$ALL" = true ]; then
    echo -e "${MAGENTA}📦 Creating deployment package...${NC}"

    PACKAGE_DIR="$PROJECT_ROOT/$PACKAGE_NAME"
    mkdir -p "$PACKAGE_DIR"

    # Copy builds
    cp -r "$BUILD_DIR" "$PACKAGE_DIR/"

    # Copy assets
    if [ -d "$ASSETS_DIR" ]; then
        cp -r "$ASSETS_DIR" "$PACKAGE_DIR/"
    fi

    # Copy documentation
    DOCS=("README.md" "DEPLOYMENT_PACKAGE_README.md" "package.json" "app.json")
    for doc in "${DOCS[@]}"; do
        if [ -f "$doc" ]; then
            cp "$doc" "$PACKAGE_DIR/"
        fi
    done

    # Create install script
    cat > "$PACKAGE_DIR/install.sh" << 'EOF'
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
EOF

    chmod +x "$PACKAGE_DIR/install.sh"

    # Create ZIP archive
    ZIP_PATH="$PROJECT_ROOT/$PACKAGE_NAME.zip"
    rm -f "$ZIP_PATH"

    if command_exists "zip"; then
        cd "$PROJECT_ROOT"
        zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME"
        cd - >/dev/null
    else
        echo -e "${YELLOW}⚠️ zip command not found, skipping ZIP creation${NC}"
    fi

    echo -e "${GREEN}📦 Package created: $ZIP_PATH${NC}"
    echo -e "${GREEN}📦 Package directory: $PACKAGE_DIR${NC}"
fi

echo ""
echo -e "${CYAN}🎉 Build and packaging completed successfully!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${WHITE}1. Test the builds on target devices/emulators${NC}"
echo -e "${WHITE}2. Submit to app stores (Google Play, Apple App Store)${NC}"
echo -e "${WHITE}3. Deploy web version to hosting service${NC}"
echo -e "${WHITE}4. Distribute the $PACKAGE_NAME.zip package${NC}"
echo ""
echo -e "${MAGENTA}⚛️ Aeonmi Quantum Workflow - Ready for deployment! 🚀${NC}"