# Simple server starter for CursorFlow
Write-Host "Starting CursorFlow Server..." -ForegroundColor Green

# Change to the correct directory
Set-Location "C:\CursorFlowWebsite\cursorflow"

# Start the development server
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev:clean

# Keep the window open if there's an error
Read-Host "Press Enter to close this window" 