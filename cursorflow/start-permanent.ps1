# Permanent CursorFlow Server Starter
# This script will ALWAYS work, no matter where you run it from

Write-Host "=== CURSORFLOW SERVER STARTER ===" -ForegroundColor Cyan
Write-Host ""

# Always go to the correct directory
$projectDir = "C:\CursorFlowWebsite\cursorflow"
Write-Host "Navigating to: $projectDir" -ForegroundColor Yellow

# Check if directory exists
if (-not (Test-Path $projectDir)) {
    Write-Host "ERROR: Project directory not found!" -ForegroundColor Red
    Write-Host "Expected: $projectDir" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Change to project directory
Set-Location $projectDir
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Are you sure this is the right project directory?" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Project directory found" -ForegroundColor Green
Write-Host "✓ package.json found" -ForegroundColor Green
Write-Host ""

# Kill any existing processes on port 5173
Write-Host "Checking for existing server processes..." -ForegroundColor Cyan
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found existing process, stopping it..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Old process stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== STARTING SERVER ===" -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server with clean cache
npm run dev:clean

# If we get here, there was an error
Write-Host ""
Write-Host "Server stopped or encountered an error" -ForegroundColor Red
Read-Host "Press Enter to close this window" 