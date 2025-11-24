@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo        ChilliSys Project Setup & Start
echo ========================================================

:: Store root dir
set "PROJECT_ROOT=%CD%"

:: --- Backend Setup ---
echo.
echo [1/2] Setting up Backend...
echo --------------------------------------------------------
cd "%PROJECT_ROOT%\backend"

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    pause
    exit /b 1
)

:: Create venv if missing
if not exist "venv" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Virtual environment found.
)

:: Activate venv and install deps
echo [INFO] Installing/Updating backend dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install python dependencies.
    pause
    exit /b 1
)

:: Start Backend in new window
echo [INFO] Starting Backend Server...
start "ChilliSys Backend" cmd /k "cd /d "%PROJECT_ROOT%" && backend\venv\Scripts\activate.bat && uvicorn backend.main:app --reload --port 8000"


:: --- Frontend Setup ---
echo.
echo [2/2] Setting up Frontend...
echo --------------------------------------------------------
cd "%PROJECT_ROOT%\frontend"

:: Check for Node
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH.
    pause
    exit /b 1
)

:: Install deps with auto-recovery
echo [INFO] Checking and installing frontend dependencies...
echo        (This may take a few minutes)

call npm install
if !errorlevel! neq 0 (
    echo.
    echo [WARN] npm install failed. Attempting auto-fix...
    echo [INFO] Cleaning cache and removing existing modules...
    
    if exist "node_modules" rd /s /q "node_modules"
    if exist ".next" rd /s /q ".next"
    if exist "package-lock.json" del "package-lock.json"
    
    call npm cache clean --force
    
    echo [INFO] Retrying installation...
    call npm install
    
    if !errorlevel! neq 0 (
        echo.
        echo [ERROR] Auto-fix failed. Please check your internet connection or try manually.
        pause
        exit /b 1
    )
)

:: Start Frontend
echo.
echo ========================================================
echo    Project is starting!
echo    Backend running on port 8000
echo    Frontend starting on port 3000...
echo ========================================================
echo.

call npm run dev
pause
