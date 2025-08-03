Write-Host "Starting CursorFlow Development Server..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
$expectedDir = "C:\CursorFlowWebsite\cursorflow"

if ($currentDir.Path -ne $expectedDir) {
    Write-Host "Changing to correct directory..." -ForegroundColor Yellow
    Set-Location $expectedDir
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
} else {
    Write-Host "Already in correct directory: $(Get-Location)" -ForegroundColor Green
}

# Clean up any existing processes on port 5173
Write-Host "Checking for existing processes on port 5173..." -ForegroundColor Cyan
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found existing process on port 5173, terminating..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Process terminated successfully." -ForegroundColor Green
}

# Clean Vite cache
Write-Host "Cleaning Vite cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "Vite cache cleaned." -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting development server with clean cache..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server with clean cache
npm run dev:clean 