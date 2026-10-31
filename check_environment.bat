@echo off
echo Checking required environment versions...

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found. Please install Python 3.9 or newer.
    exit /b 1
)
python --version

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Please install Node.js 18 or newer.
    exit /b 1
)
node --version

echo Checking backend environment configuration...
if not exist backend\.env (
    echo backend\.env file not found yet. After backend files arrive, copy backend\.env.example to backend\.env and configure it.
)

echo Environment check completed.
pause
