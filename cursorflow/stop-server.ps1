Write-Host "Stopping CursorFlow Development Server..." -ForegroundColor Red
Write-Host ""

# Kill any processes on port 5173
$existingProcess = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "Found process on port 5173, terminating..." -ForegroundColor Yellow
    $processId = $existingProcess.OwningProcess
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Process terminated successfully." -ForegroundColor Green
} else {
    Write-Host "No process found on port 5173." -ForegroundColor Cyan
}

# Kill any Vite-related node processes
$viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.ProcessName -eq "node" -and $_.MainWindowTitle -match "vite"
}

if ($viteProcesses) {
    Write-Host "Found Vite processes, terminating..." -ForegroundColor Yellow
    $viteProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Vite processes terminated successfully." -ForegroundColor Green
} else {
    Write-Host "No Vite processes found." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Server stopped successfully!" -ForegroundColor Green
Read-Host "Press Enter to close" 