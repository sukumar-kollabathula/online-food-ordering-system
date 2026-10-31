@echo off
echo Starting backend server...

if not exist env\Scripts\activate.bat (
    echo Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist backend\app.py (
    echo backend\app.py has not been received yet.
    pause
    exit /b 1
)

call env\Scripts\activate.bat
set FLASK_APP=backend\app.py
set FLASK_DEBUG=1
echo Running Flask backend on http://localhost:5000
python -m flask --app backend.app run
