Write-Host "Stopping CursorFlow Development Server..." -ForegroundColor Red
Write-Host ""

# Kill any processes on port 5173
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found process on port 5173, terminating..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Process terminated successfully." -ForegroundColor Green
} else {
    Write-Host "No process found on port 5173." -ForegroundColor Cyan
}

# Kill any Vite-related node processes
$viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -eq "node" -and (
        $_.MainWindowTitle -match "vite" -or 
        $_.CommandLine -match "vite" -or
        $_.ProcessName -eq "node"
    )
}

if ($viteProcesses) {
    Write-Host "Found Node.js processes, terminating..." -ForegroundColor Yellow
    $viteProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Node.js processes terminated successfully." -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Cyan
}

# Clean Vite cache
Write-Host "Cleaning Vite cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "Vite cache cleaned." -ForegroundColor Green
}

# Kill any remaining processes that might be using the port
Write-Host "Checking for any remaining processes..." -ForegroundColor Cyan
$remainingProcesses = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "Found remaining processes, force terminating..." -ForegroundColor Yellow
    $remainingProcesses | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "All remaining processes terminated." -ForegroundColor Green
}

Write-Host ""
Write-Host "Server stopped successfully!" -ForegroundColor Green
Write-Host "You can now restart the server with: npm run dev:clean" -ForegroundColor Cyan
Read-Host "Press Enter to close" 