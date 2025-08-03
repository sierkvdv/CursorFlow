@echo off
echo ========================================
echo    CURSORFLOW SERVER STARTER
echo ========================================
echo.

echo Navigating to project directory...
cd /d "C:\CursorFlowWebsite\cursorflow"

if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Are you sure this is the right project directory?
    pause
    exit /b 1
)

echo ✓ Project directory found
echo ✓ package.json found
echo.

echo ========================================
echo    STARTING SERVER
echo ========================================
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev:clean

echo.
echo Server stopped or encountered an error
pause 