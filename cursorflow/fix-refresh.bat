@echo off
echo Fixing CursorFlow Page Refresh Issues...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0fix-refresh.ps1"

pause 