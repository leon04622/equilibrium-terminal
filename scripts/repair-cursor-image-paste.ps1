# Repairs common Windows Cursor issues with image paste / attach in Agent chat.
# Run once: npm run cursor:fix-images

$ErrorActionPreference = "Continue"

$cursorUser = Join-Path (Join-Path $env:APPDATA "Cursor") "User"
$keybindings = Join-Path $cursorUser "keybindings.json"
$settings = Join-Path $cursorUser "settings.json"

Write-Host "Repairing Cursor image paste settings..." -ForegroundColor Cyan

$bindingsJson = @'
[
  {
    "key": "ctrl+v",
    "command": "editor.action.clipboardPasteAction",
    "when": "textInputFocus && !editorReadonly"
  },
  {
    "key": "ctrl+v",
    "command": "editor.action.clipboardPasteAction",
    "when": "inputFocus && !editorReadonly"
  }
]
'@

if (Test-Path $keybindings) {
  Write-Host "  keybindings.json already exists at:" -ForegroundColor Yellow
  Write-Host "  $keybindings"
} else {
  Set-Content -Path $keybindings -Value $bindingsJson -Encoding UTF8
  Write-Host "  Created keybindings.json" -ForegroundColor Green
}

if (Test-Path $settings) {
  $raw = Get-Content $settings -Raw
  if ($raw -notlike "*editor.pasteAs.enabled*") {
    $updated = $raw.TrimEnd()
    if ($updated.EndsWith("}")) {
      $updated = $updated.Substring(0, $updated.Length - 1)
      if (-not $updated.EndsWith(",")) { $updated += "," }
      $updated += "`n    `"editor.pasteAs.enabled`": true`n}"
      Set-Content -Path $settings -Value $updated -Encoding UTF8
      Write-Host "  Enabled editor.pasteAs.enabled" -ForegroundColor Green
    }
  }
}

$wsRoot = Join-Path $cursorUser "workspaceStorage"
if (Test-Path $wsRoot) {
  $cleared = 0
  Get-ChildItem $wsRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    foreach ($sub in @("images", "imageCache", "chat-images")) {
      $p = Join-Path $_.FullName $sub
      if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        $cleared++
      }
    }
  }
  if ($cleared -gt 0) {
    Write-Host "  Cleared $cleared stale image cache folder(s)" -ForegroundColor Green
  }
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Ctrl+Shift+P -> Developer: Reload Window"
Write-Host "  2. Win+Shift+S -> npm run screenshot"
Write-Host "  3. In chat type @ and pick .cursor/chat-screenshots/latest.png"
Write-Host ""
