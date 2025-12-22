# Script de lancement Application Flutter StudentCoach
# Execution: .\services\student-coach-flutter\start-flutter.ps1

Write-Host "`n=== LANCEMENT APPLICATION FLUTTER STUDENTCOACH ===" -ForegroundColor Green

# 1. Aller dans le bon repertoire
Write-Host "`n[1/4] Changement de repertoire..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "      OK - $(Get-Location)" -ForegroundColor Green

# 2. Verifier Flutter
Write-Host "`n[2/4] Verification Flutter..." -ForegroundColor Yellow
$flutterVersion = flutter --version 2>&1 | Select-Object -First 1
Write-Host "      OK - $flutterVersion" -ForegroundColor Green

# 3. Installer les dependances
Write-Host "`n[3/4] Installation des dependances..." -ForegroundColor Yellow
flutter pub get | Out-Null
Write-Host "      OK - Dependances installees" -ForegroundColor Green

# 4. Lancer l'application
Write-Host "`n[4/4] Lancement de l'application sur Chrome..." -ForegroundColor Yellow
Write-Host "      (Premier lancement peut prendre 1-2 minutes)`n" -ForegroundColor Gray
Write-Host "L'application va s'ouvrir dans Chrome" -ForegroundColor Cyan
Write-Host "Appuyez sur 'r' pour hot reload, 'R' pour hot restart" -ForegroundColor Cyan
Write-Host "Appuyez sur 'q' pour quitter`n" -ForegroundColor Cyan

flutter run -d chrome
