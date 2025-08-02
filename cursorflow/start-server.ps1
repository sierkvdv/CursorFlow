Write-Host "Starting CursorFlow Development Server..." -ForegroundColor Green
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

# Check if node_modules exists, if not install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Kill any existing Vite processes on port 5173
Write-Host "Checking for existing server processes..." -ForegroundColor Cyan
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found existing process on port 5173, terminating..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Kill any existing node processes that might be Vite
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -eq "node" -and $_.MainWindowTitle -match "vite"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "The server will be available at: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "If port 5173 is busy, Vite will automatically use the next available port." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Start the development server
try {
    npm run dev
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Write-Host "Trying to start with explicit port..." -ForegroundColor Yellow
    npx vite --port 5174 --host 0.0.0.0
}

# Keep the window open
Read-Host "Press Enter to close" 