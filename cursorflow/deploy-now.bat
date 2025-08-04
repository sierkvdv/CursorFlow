@echo off
echo Pushing changes to Vercel...

cd /d "C:\CursorFlowWebsite\cursorflow"

git add .
git commit -m "Update"
git push

echo Done! Check your phone in 2 minutes.
pause 