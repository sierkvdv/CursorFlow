@echo off
echo Starting CursorFlow Development Server...
echo.
echo The server will be available at: http://localhost:5173/
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
npm run dev
pause 