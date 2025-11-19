# Aeonmi Quantum Workflow - Build Validation Script (PowerShell)
# Validates that the app builds correctly and all components work

param(
    [switch]$Quick,
    [switch]$Full
)

# Colors
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"
$MAGENTA = "Magenta"

Write-Host "🔍 Aeonmi Quantum Workflow - Build Validation" -ForegroundColor $BLUE
Write-Host ""

$FailedChecks = @()

# Function to run validation check
function Test-Validation {
    param([string]$Name, [string]$Command)
    Write-Host "Testing: $Name" -ForegroundColor $YELLOW
    try {
        $result = Invoke-Expression $Command 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Name`: PASSED" -ForegroundColor $GREEN
            return $true
        } else {
            throw "Command failed"
        }
    } catch {
        Write-Host "❌ $Name`: FAILED" -ForegroundColor $RED
        $script:FailedChecks += $Name
        return $false
    }
}

# 1. Check prerequisites
Write-Host "🔧 Checking Prerequisites..." -ForegroundColor $BLUE

Test-Validation "Node.js" "node --version" | Out-Null
Test-Validation "npm" "npm --version" | Out-Null
Test-Validation "Expo CLI" "npx expo --version" | Out-Null

# 2. Check project structure
Write-Host "📁 Checking Project Structure..." -ForegroundColor $BLUE

Test-Validation "package.json exists" "Test-Path package.json" | Out-Null
Test-Validation "app.json exists" "Test-Path app.json" | Out-Null
Test-Validation "App.tsx exists" "Test-Path App.tsx" | Out-Null
Test-Validation "src/ directory exists" "Test-Path src" | Out-Null

# 3. Check dependencies
Write-Host "📦 Checking Dependencies..." -ForegroundColor $BLUE

if (Test-Path "package.json") {
    Test-Validation "Dependencies installed" "Test-Path node_modules" | Out-Null
} else {
    $FailedChecks += "package.json missing"
}

# 4. TypeScript compilation
Write-Host "🔧 TypeScript Compilation..." -ForegroundColor $BLUE

Test-Validation "TypeScript compilation" "npx tsc --noEmit" | Out-Null

# 5. ESLint check (skip if quick mode)
if (-not $Quick) {
    Write-Host "🧹 Code Quality (ESLint)..." -ForegroundColor $BLUE

    if (Get-Command "npx" -ErrorAction SilentlyContinue) {
        Test-Validation "ESLint check" "npx eslint . --ext .ts,.tsx --max-warnings 0" | Out-Null
    } else {
        Write-Host "⚠️ ESLint not available, skipping" -ForegroundColor $YELLOW
    }
}

# 6. Expo configuration
Write-Host "⚙️ Expo Configuration..." -ForegroundColor $BLUE

Test-Validation "Expo doctor" "npx expo doctor" | Out-Null

# 7. Asset validation
Write-Host "🎨 Asset Validation..." -ForegroundColor $BLUE

Test-Validation "assets/ directory" "Test-Path assets" | Out-Null

$iconExists = (Test-Path "assets/icon.png") -or (Test-Path "assets/icon.svg")
if (-not $iconExists) {
    Write-Host "❌ App icon: FAILED" -ForegroundColor $RED
    $FailedChecks += "icon"
} else {
    Write-Host "✅ App icon: PASSED" -ForegroundColor $GREEN
}

$splashExists = (Test-Path "assets/splash.png") -or (Test-Path "assets/splash.svg")
if (-not $splashExists) {
    Write-Host "❌ Splash screen: FAILED" -ForegroundColor $RED
    $FailedChecks += "splash"
} else {
    Write-Host "✅ Splash screen: PASSED" -ForegroundColor $GREEN
}

# 8. Build test (web) - skip if quick mode
if ($Full -or (-not $Quick)) {
    Write-Host "🔨 Build Test (Web)..." -ForegroundColor $BLUE

    # Create temp directory for test build
    $tempDir = Join-Path $env:TEMP "aeonmi-web-test"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }

    $buildSuccess = Test-Validation "Web build test" "npx expo export --platform web --dev --output-dir '$tempDir'"

    # Clean up
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}

# Summary
Write-Host ""
Write-Host "📊 Validation Summary" -ForegroundColor $BLUE

if ($FailedChecks.Count -eq 0) {
    Write-Host "🎉 All checks passed! Ready for deployment." -ForegroundColor $GREEN
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor $YELLOW
    Write-Host "1. Run: .\create-deployment-package.ps1 -All" -ForegroundColor White
    Write-Host "2. Test builds on devices" -ForegroundColor White
    Write-Host "3. Submit to app stores" -ForegroundColor White
    exit 0
} else {
    Write-Host "❌ $($FailedChecks.Count) check(s) failed:" -ForegroundColor $RED
    foreach ($check in $FailedChecks) {
        Write-Host "  - $check" -ForegroundColor $RED
    }
    Write-Host ""
    Write-Host "Please fix the failed checks before building." -ForegroundColor $YELLOW
    exit 1
}