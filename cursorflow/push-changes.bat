@echo off
cd /d "C:\CursorFlowWebsite\cursorflow"
git add .
git commit -m "Fix iOS cursor effects and improve rain visibility - use CSS-based trail"
git push
pause 