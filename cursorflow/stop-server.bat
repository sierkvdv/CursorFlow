@echo off
echo Stopping CursorFlow Development Server...
echo.

REM Kill any processes on port 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Found process %%a on port 5173, terminating...
    taskkill /f /pid %%a >nul 2>&1
    echo Process terminated successfully.
    goto :found
)

echo No process found on port 5173.
:found

REM Kill any node processes that might be Vite
tasklist /fi "imagename eq node.exe" /fo csv | findstr /i "vite" >nul
if %errorlevel% equ 0 (
    echo Found Vite processes, terminating...
    taskkill /f /im node.exe >nul 2>&1
    echo Vite processes terminated successfully.
) else (
    echo No Vite processes found.
)

echo.
echo Server stopped successfully!
pause 