# Script PowerShell pour lancer rapidement le projet
# Usage: .\COMMANDE_RAPIDE.ps1

Write-Host "`n=== EduPath-MS - Lancement Rapide ===" -ForegroundColor Green

# Vérifier qu'on est dans le bon répertoire
$currentDir = Get-Location
$expectedDir = "EduPath-MS-EMSI"

if ($currentDir.Path -notlike "*$expectedDir*") {
    Write-Host "⚠️  Vous n'êtes pas dans le bon répertoire !" -ForegroundColor Yellow
    Write-Host "Navigation vers: $PSScriptRoot\$expectedDir" -ForegroundColor Cyan
    
    if (Test-Path "$PSScriptRoot\$expectedDir") {
        Set-Location "$PSScriptRoot\$expectedDir"
    } elseif (Test-Path ".\$expectedDir") {
        Set-Location ".\$expectedDir"
    } else {
        Write-Host "❌ Répertoire EduPath-MS-EMSI non trouvé !" -ForegroundColor Red
        Write-Host "Veuillez naviguer manuellement vers le répertoire du projet." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Répertoire: $(Get-Location)" -ForegroundColor Green

# Vérifier que docker-compose.yml existe
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Fichier docker-compose.yml non trouvé !" -ForegroundColor Red
    exit 1
}

Write-Host "✅ docker-compose.yml trouvé" -ForegroundColor Green

# Lancer les services
Write-Host "`n🚀 Démarrage des services..." -ForegroundColor Cyan
docker-compose up -d

# Attendre un peu
Start-Sleep -Seconds 3

# Afficher l'état
Write-Host "`n📊 État des services:" -ForegroundColor Cyan
docker-compose ps

# Afficher les URLs
Write-Host "`n🌐 Interfaces disponibles:" -ForegroundColor Cyan
Write-Host "  - AdminConsole: http://localhost:3006" -ForegroundColor White
Write-Host "  - StudentPortal: http://localhost:3009" -ForegroundColor White
Write-Host "  - MLflow: http://localhost:5000" -ForegroundColor White
Write-Host "  - Airflow: http://localhost:8080" -ForegroundColor White
Write-Host "  - MinIO Console: http://localhost:9001" -ForegroundColor White

Write-Host "`n✅ Terminé !" -ForegroundColor Green

