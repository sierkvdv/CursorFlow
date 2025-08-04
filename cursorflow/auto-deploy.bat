@echo off
chcp 65001 >nul
echo 🚀 Starting Auto-Deploy for CursorFlow...

cd /d "C:\CursorFlowWebsite\cursorflow"

echo 📝 Checking for changes...
git status --porcelain > temp_status.txt
set /p has_changes=<temp_status.txt
del temp_status.txt

if not "%has_changes%"=="" (
    echo 📝 Changes detected, committing...
    git add .
    
    for /f "tokens=1-6 delims=/: " %%a in ('echo %date% %time%') do set timestamp=%%c-%%b-%%a %%d:%%e:%%f
    git commit -m "Auto-deploy: %timestamp%"
    
    echo 📤 Pushing to Git...
    git push
    
    echo ✅ Changes pushed successfully!
    echo 🔄 Vercel will automatically deploy in a few minutes...
    echo 🌐 Check your Vercel dashboard for deployment status
) else (
    echo ✅ No changes detected - everything is up to date!
)

echo.
echo Press Enter to close this window...
pause >nul 