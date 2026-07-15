# Saves the clipboard image to .cursor/chat-screenshots/latest.png for @ attach in Cursor chat.
# Usage: Win+Shift+S (screenshot) -> run: npm run screenshot

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dir = Join-Path (Join-Path $root ".cursor") "chat-screenshots"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($null -eq $img) {
  Write-Host ""
  Write-Host "No image on clipboard." -ForegroundColor Yellow
  Write-Host "1. Press Win+Shift+S and capture a region" -ForegroundColor Cyan
  Write-Host "2. Run this script again (npm run screenshot)" -ForegroundColor Cyan
  exit 1
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stamped = Join-Path $dir "screenshot-$stamp.png"
$latest = Join-Path $dir "latest.png"

$img.Save($stamped, [System.Drawing.Imaging.ImageFormat]::Png)
Copy-Item -Path $stamped -Destination $latest -Force

Write-Host ""
Write-Host "Saved screenshot:" -ForegroundColor Green
Write-Host "  $latest"
Write-Host ""
Write-Host "In Cursor chat:" -ForegroundColor Cyan
Write-Host "  1. Click the chat input"
Write-Host "  2. Type @"
Write-Host "  3. Pick: .cursor/chat-screenshots/latest.png"
Write-Host "  4. Add your message and send"
Write-Host ""
