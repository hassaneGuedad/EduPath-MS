# Script d'installation et configuration de StudentCoach API pour Windows

Write-Host "Installation de StudentCoach API..." -ForegroundColor Green

# 1. Installer les dependances Python
Write-Host "Installation des dependances Python..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur lors de l'installation des dependances" -ForegroundColor Red
    exit 1
}

# 2. Creer la base de donnees PostgreSQL
Write-Host "Configuration de la base de donnees..." -ForegroundColor Yellow
docker exec -it edupath-postgres psql -U edupath -d postgres -c "CREATE DATABASE edupath_coaching;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Base de donnees existe deja ou erreur de creation" -ForegroundColor Cyan
}

# 3. Initialiser les tables
Write-Host "Initialisation des tables..." -ForegroundColor Yellow
Get-Content "..\..\database\init_coaching.sql" | docker exec -i edupath-postgres psql -U edupath -d edupath_coaching

# 4. Creer le fichier .env
if (-Not (Test-Path ".env")) {
    Write-Host "Creation du fichier .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Fichier .env cree. Pensez a le modifier si necessaire." -ForegroundColor Green
} else {
    Write-Host "Fichier .env existe deja" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Installation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour demarrer l'API :" -ForegroundColor Cyan
Write-Host "  uvicorn src.main:app --host 0.0.0.0 --port 3007 --reload" -ForegroundColor White
Write-Host ""
Write-Host "Documentation API disponible sur :" -ForegroundColor Cyan
Write-Host "  http://localhost:3007/docs" -ForegroundColor White
