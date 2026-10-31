@echo off
echo Starting frontend server...

if not exist frontend\package.json (
    echo frontend\package.json has not been received yet.
    pause
    exit /b 1
)

cd frontend
npm run dev
