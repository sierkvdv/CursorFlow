Write-Host "Starting CursorFlow Development Server..." -ForegroundColor Green
Write-Host ""
Write-Host "The server will be available at: http://localhost:5173/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

# Start the development server
npm run dev

# Keep the window open
Read-Host "Press Enter to close" 