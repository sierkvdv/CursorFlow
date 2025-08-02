@echo off
echo Starting CursorFlow Development Server...
echo.

REM Change to the script directory
cd /d "%~dp0"

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Kill any existing processes on port 5173
echo Checking for existing server processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Found process %%a on port 5173, terminating...
    taskkill /f /pid %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo The server will be available at: http://localhost:5173/
echo If port 5173 is busy, Vite will automatically use the next available port.
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
npm run dev

pause 