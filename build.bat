@echo off
REM Aeonmi Application Build Script
REM Builds and packages the Aeonmi application into a standalone .exe

echo Building Aeonmi Application...

REM Set build variables
set BUILD_DIR=build
set SRC_DIR=.
set OUTPUT_FILE=aeonmi_app.exe
set RUNTIME_FILE=aeonmi_runtime.py

REM Create build directory if it doesn't exist
if not exist %BUILD_DIR% (
    mkdir %BUILD_DIR%
    echo Created build directory
)

REM Copy source files to build directory
echo Copying source files...
xcopy /E /I /Y "%SRC_DIR%\*.aeonmi" "%BUILD_DIR%\"
xcopy /E /I /Y "%SRC_DIR%\*.qube" "%BUILD_DIR%\"
xcopy /E /I /Y "%SRC_DIR%\core\*.aeonmi" "%BUILD_DIR%\core\"
xcopy /E /I /Y "%SRC_DIR%\core\*.qube" "%BUILD_DIR%\core\"
xcopy /E /I /Y "%SRC_DIR%\ui\*.qube" "%BUILD_DIR%\ui\"
xcopy /E /I /Y "%SRC_DIR%\data\*.aeonmi" "%BUILD_DIR%\data\"
copy "%SRC_DIR%\%RUNTIME_FILE%" "%BUILD_DIR%\"

REM Build the standalone executable using PyInstaller
echo Building standalone executable...
cd %BUILD_DIR%
pyinstaller --onefile --windowed --name=%OUTPUT_FILE:.exe=% %RUNTIME_FILE%

REM Move the executable to the build root
if exist "dist\%OUTPUT_FILE%" (
    move "dist\%OUTPUT_FILE%" "%OUTPUT_FILE%"
    rmdir /S /Q dist
    rmdir /S /Q build
)

REM Clean up build artifacts
if exist "%OUTPUT_FILE:.exe%*.spec" del "%OUTPUT_FILE:.exe%*.spec"

cd ..

echo Build completed successfully!
echo Output: %BUILD_DIR%\%OUTPUT_FILE%
echo.
echo To run the application:
echo cd %BUILD_DIR%
echo %OUTPUT_FILE%
echo.
pause