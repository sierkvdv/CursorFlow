# Simple server starter for CursorFlow with auto-deploy
Write-Host "Starting CursorFlow Server..." -ForegroundColor Green

# Change to the correct directory
Set-Location "C:\CursorFlowWebsite\cursorflow"

# Check if user wants to deploy changes
Write-Host "Do you want to deploy changes to Vercel? (y/n)" -ForegroundColor Yellow
$deployChoice = Read-Host

if ($deployChoice -eq "y" -or $deployChoice -eq "Y") {
    Write-Host "🚀 Deploying changes..." -ForegroundColor Cyan
    
    # Check if there are changes
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-deploy: $timestamp"
        git push
        Write-Host "✅ Changes deployed! Vercel will update in a few minutes." -ForegroundColor Green
    } else {
        Write-Host "✅ No changes to deploy!" -ForegroundColor Green
    }
}

# Start the development server
Write-Host ""
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev:clean

# Keep the window open if there's an error
Read-Host "Press Enter to close this window" 