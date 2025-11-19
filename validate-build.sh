#!/bin/bash

# Aeonmi Quantum Workflow - Build Validation Script (Bash)
# Validates that the app builds correctly and all components work

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Aeonmi Quantum Workflow - Build Validation${NC}"
echo ""

# Function to run validation check
validate() {
    local name="$1"
    local cmd="$2"
    echo -e "${YELLOW}Testing: $name${NC}"
    if eval "$cmd" 2>/dev/null; then
        echo -e "${GREEN}✅ $name: PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: FAILED${NC}"
        return 1
    fi
}

FAILED_CHECKS=()

# 1. Check prerequisites
echo -e "${BLUE}🔧 Checking Prerequisites...${NC}"

check_prereq() {
    local name="$1"
    local cmd="$2"
    if command -v "$name" >/dev/null 2>&1; then
        local version
        version=$(eval "$cmd" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ $name: $version${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $name not found, skipping${NC}"
        return 1
    fi
}

# Check prerequisites (don't fail if not found)
check_prereq "node" "node --version" || true
check_prereq "npm" "npm --version" || true
check_prereq "npx" "npx --version" || true

# 2. Check project structure
echo -e "${BLUE}📁 Checking Project Structure...${NC}"

validate "package.json exists" "test -f package.json" || FAILED_CHECKS+=("package.json")
validate "app.json exists" "test -f app.json" || FAILED_CHECKS+=("app.json")
validate "App.tsx exists" "test -f App.tsx" || FAILED_CHECKS+=("App.tsx")
validate "src/ directory exists" "test -d src" || FAILED_CHECKS+=("src/")

# 3. Check dependencies
echo -e "${BLUE}📦 Checking Dependencies...${NC}"

if [ -f "package.json" ]; then
    validate "Dependencies installed" "test -d node_modules" || FAILED_CHECKS+=("node_modules")
else
    FAILED_CHECKS+=("package.json missing")
fi

# 4. TypeScript compilation
echo -e "${BLUE}🔧 TypeScript Compilation...${NC}"

validate "TypeScript compilation" "npx tsc --noEmit" || FAILED_CHECKS+=("TypeScript")

# 5. ESLint check (optional)
echo -e "${BLUE}🧹 Code Quality (ESLint)...${NC}"

if command -v npx >/dev/null 2>&1; then
    validate "ESLint check" "npx eslint . --ext .ts,.tsx --max-warnings 0" || echo -e "${YELLOW}⚠️ ESLint failed, but continuing${NC}"
else
    echo -e "${YELLOW}⚠️ ESLint not available, skipping${NC}"
fi

# 6. Expo configuration (optional)
echo -e "${BLUE}⚙️ Expo Configuration...${NC}"

validate "Expo doctor" "npx expo-doctor" || echo -e "${YELLOW}⚠️ Expo doctor failed, but continuing${NC}"

# 7. Asset validation
echo -e "${BLUE}🎨 Asset Validation...${NC}"

validate "assets/ directory" "test -d assets" || FAILED_CHECKS+=("assets/")
validate "App icon" "test -f assets/icon.png -o -f assets/icon.svg" || FAILED_CHECKS+=("icon")
validate "Splash screen" "test -f assets/splash.png -o -f assets/splash.svg" || FAILED_CHECKS+=("splash")

# 8. Build test (web) - optional
echo -e "${BLUE}🔨 Build Test (Web)...${NC}"

validate "Web build test" "timeout 30 npx expo export --platform web --dev --output-dir /tmp/aeonmi-web-test" || echo -e "${YELLOW}⚠️ Web build test failed, but continuing${NC}"

# Summary
echo ""
echo -e "${BLUE}📊 Validation Summary${NC}"

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Run: ./create-deployment-package.sh --all"
    echo -e "2. Test builds on devices"
    echo -e "3. Submit to app stores"
    exit 0
else
    echo -e "${RED}❌ ${#FAILED_CHECKS[@]} check(s) failed:${NC}"
    for check in "${FAILED_CHECKS[@]}"; do
        echo -e "${RED}  - $check${NC}"
    done
    echo ""
    echo -e "${YELLOW}Please fix the failed checks before building.${NC}"
    exit 1
fi