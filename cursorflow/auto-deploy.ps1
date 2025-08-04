# Auto-deploy script for CursorFlow
# This script automatically commits changes and deploys to Vercel

Write-Host "🚀 Starting Auto-Deploy for CursorFlow..." -ForegroundColor Green

# Change to the correct directory
Set-Location "C:\CursorFlowWebsite\cursorflow"

# Check if there are any changes to commit
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "📝 Changes detected, committing..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Create commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto-deploy: $timestamp"
    
    Write-Host "📤 Pushing to Git..." -ForegroundColor Cyan
    git push
    
    Write-Host "✅ Changes pushed successfully!" -ForegroundColor Green
    Write-Host "🔄 Vercel will automatically deploy in a few minutes..." -ForegroundColor Cyan
    Write-Host "🌐 Check your Vercel dashboard for deployment status" -ForegroundColor Yellow
} else {
    Write-Host "✅ No changes detected - everything is up to date!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press Enter to close this window..."
Read-Host 