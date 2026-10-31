@echo off
rem ------------------------------------------------------------
rem setup.bat – prepares a virtual environment with a compatible Python version
rem ------------------------------------------------------------

rem ------------------------------------------------------------
rem Step 1: Ensure a compatible Python (3.11 or 3.12) is installed
rem ------------------------------------------------------------
rem If you have Python 3.11/3.12 installed, the command "python3.11" (or "python3.12") will be found.
rem Otherwise, download it from https://www.python.org/downloads/windows/ and install.

rem ------------------------------------------------------------
rem Step 2: Create the virtual environment
rem ------------------------------------------------------------
rem Try python3.11 first, then python3.12. If neither is found, the script aborts.
python3.11 -m venv venv
if %errorlevel% neq 0 (
    python3.12 -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: No compatible Python (3.11 or 3.12) found in PATH.
        echo Install Python 3.11 or 3.12 and ensure "python3.11" (or "python3.12") is reachable.
        pause
        exit /b 1
    )
)

rem ------------------------------------------------------------
rem Step 3: Activate the venv
rem ------------------------------------------------------------
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b 1
)

rem ------------------------------------------------------------
rem Step 4: Upgrade pip and install backend requirements
rem ------------------------------------------------------------
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r backend\requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install required Python packages.
    pause
    exit /b 1
)


echo Setup completed successfully.
echo You can now start the backend with start_backend.bat and the frontend with start_frontend.bat.
pause
