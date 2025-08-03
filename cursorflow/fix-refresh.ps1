Write-Host "Fixing CursorFlow Page Refresh Issues..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
$expectedDir = "C:\CursorFlowWebsite\cursorflow"

if ($currentDir.Path -ne $expectedDir) {
    Write-Host "Changing to correct directory..." -ForegroundColor Yellow
    Set-Location $expectedDir
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
}

Write-Host "Step 1: Stopping all existing processes..." -ForegroundColor Cyan

# Kill any processes on port 5173
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found process on port 5173, terminating..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "Process terminated successfully." -ForegroundColor Green
}

# Kill any Node.js processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found Node.js processes, terminating..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "Node.js processes terminated successfully." -ForegroundColor Green
}

Write-Host "Step 2: Cleaning Vite cache..." -ForegroundColor Cyan

# Clean Vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "Vite cache cleaned." -ForegroundColor Green
}

# Clean dist folder if it exists
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "Dist folder cleaned." -ForegroundColor Green
}

Write-Host "Step 3: Verifying port is free..." -ForegroundColor Cyan

# Wait a bit more to ensure port is free
Start-Sleep -Seconds 2

$remainingProcesses = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "WARNING: Port 5173 is still in use!" -ForegroundColor Red
    Write-Host "Please manually close any applications using this port." -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway"
} else {
    Write-Host "Port 5173 is free and ready." -ForegroundColor Green
}

Write-Host "Step 4: Starting development server with clean cache..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "Page refreshes should now work correctly!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server with clean cache
npm run dev:clean 