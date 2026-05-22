# Stop stale Next.js on port 3000, rebuild, and start production server.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Stopping processes on port 3000..."
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }
Start-Sleep -Seconds 2

Write-Host "Cleaning production build output..."
if (Test-Path ".next") {
  Remove-Item -Recurse -Force ".next"
}

Write-Host "Building..."
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Build failed." -ForegroundColor Red
  exit 1
}

Write-Host "Starting on http://localhost:3000 ..."
npm run start:local
