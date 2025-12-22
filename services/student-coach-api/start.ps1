# Script de demarrage StudentCoach API
# Execution: Depuis n'importe quel repertoire, executer:
#   C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI\services\student-coach-api\start.ps1
# Ou depuis le repertoire du projet:
#   cd C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI
#   .\services\student-coach-api\start.ps1

Write-Host "`n=== DEMARRAGE STUDENTCOACH API ===" -ForegroundColor Green

# 1. Arreter l'ancien container Docker
Write-Host "`n[1/4] Arret de l'ancien container Docker..." -ForegroundColor Yellow
docker stop edupath-student-coach-api 2>$null | Out-Null
Write-Host "      OK" -ForegroundColor Green

# 2. Aller dans le bon repertoire
Write-Host "`n[2/4] Changement de repertoire..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "      OK - $(Get-Location)" -ForegroundColor Green

# 3. Configurer l'environnement
Write-Host "`n[3/4] Configuration PYTHONPATH..." -ForegroundColor Yellow
$env:PYTHONPATH = (Get-Location).Path
Write-Host "      OK - $env:PYTHONPATH" -ForegroundColor Green

# 4. Demarrer l'API
Write-Host "`n[4/4] Demarrage de l'API sur http://127.0.0.1:3007..." -ForegroundColor Yellow
Write-Host "`n📚 Documentation: http://localhost:3007/docs" -ForegroundColor Cyan
Write-Host "🔍 Health check:  http://localhost:3007/health" -ForegroundColor Cyan
Write-Host "`nAppuyez sur CTRL+C pour arreter`n" -ForegroundColor Gray

& "C:\Users\youbitech\Desktop\Edu_Path\.venv\Scripts\uvicorn.exe" src.main:app --host 127.0.0.1 --port 3007 --reload
