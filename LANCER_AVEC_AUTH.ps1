# Script de lancement complet de l'application StudentCoach avec authentification
# Dernière mise à jour : 21 décembre 2025

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      🚀 LANCEMENT STUDENTCOACH AVEC AUTH              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Variables
$PROJECT_ROOT = "C:\Users\youbitech\Desktop\Edu_Path\EduPath-MS-EMSI"
$FLUTTER_DIR = "$PROJECT_ROOT\services\student-coach-flutter"

# Étape 1 : Démarrer les services Docker
Write-Host "📦 Étape 1/4 : Démarrage des services Docker..." -ForegroundColor Yellow
Set-Location $PROJECT_ROOT

docker-compose up -d postgres auth-service student-coach-api prepa-data student-profiler

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage des services Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Services Docker démarrés" -ForegroundColor Green

# Étape 2 : Attendre que les services soient prêts
Write-Host "`n⏳ Étape 2/4 : Attente du démarrage des services (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Étape 3 : Vérifier les services
Write-Host "`n🔍 Étape 3/4 : Vérification des services..." -ForegroundColor Yellow

try {
    $authTest = Invoke-RestMethod -Uri "http://localhost:3008/docs" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Auth Service (3008) : OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Auth Service (3008) : Pas de réponse" -ForegroundColor Yellow
}

try {
    $coachTest = Invoke-RestMethod -Uri "http://localhost:3007/docs" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ StudentCoach API (3007) : OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  StudentCoach API (3007) : Pas de réponse" -ForegroundColor Yellow
}

# Étape 4 : Lancer Flutter
Write-Host "`n🎯 Étape 4/4 : Lancement de l'application Flutter..." -ForegroundColor Yellow
Set-Location $FLUTTER_DIR

Write-Host "`nFlutter va se lancer dans Chrome..." -ForegroundColor Cyan
Write-Host "📱 L'application s'ouvrira automatiquement`n" -ForegroundColor Cyan

# Lancer Flutter sur Chrome
flutter run -d chrome

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✅ APPLICATION LANCÉE                             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🔑 COMPTES DISPONIBLES :" -ForegroundColor Yellow
Write-Host ""
Write-Host "  📧 Email    : mohamed.alami@emsi-edu.ma" -ForegroundColor Cyan
Write-Host "  🔒 Password : student123" -ForegroundColor Cyan
Write-Host "  👤 Profil   : At Risk (Student ID: 12345)" -ForegroundColor Red
Write-Host ""
Write-Host "  📧 Email    : fatima.benali@emsi-edu.ma" -ForegroundColor Cyan
Write-Host "  🔒 Password : student123" -ForegroundColor Cyan
Write-Host "  👤 Profil   : High Performer (Student ID: 12346)" -ForegroundColor Green
Write-Host ""
Write-Host "  📧 Email    : youssef.kadiri@emsi-edu.ma" -ForegroundColor Cyan
Write-Host "  🔒 Password : student123" -ForegroundColor Cyan
Write-Host "  👤 Profil   : Average Learner (Student ID: 12347)" -ForegroundColor Blue
Write-Host ""
Write-Host "📚 Documentation : services\student-coach-flutter\GUIDE_CONNEXION.md" -ForegroundColor Magenta
Write-Host ""
