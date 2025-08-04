# CursorFlow Deploy Script
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   CURSORFLOW DEPLOY TO GITHUB" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Navigate to project directory
Set-Location "C:\CursorFlowWebsite\cursorflow"

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Restore beautiful rain style: original thin drops with proper timing - no more weird streaks on load"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "=========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "   Now redeploy on Vercel to test on iPhone" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Read-Host "Press Enter to continue..." 