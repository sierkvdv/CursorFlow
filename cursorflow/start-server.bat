@echo off
echo Starting CursorFlow Development Server...
echo.

cd /d "C:\CursorFlowWebsite\cursorflow"

echo Current directory: %CD%
echo.

echo Starting development server...
echo Server will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm run dev:clean

pause 