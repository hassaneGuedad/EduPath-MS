# Script pour initialiser des données de test pour un student_id
# Usage: .\init-student-data.ps1 -StudentId 12400

param(
    [Parameter(Mandatory=$true)]
    [int]$StudentId,
    
    [Parameter(Mandatory=$false)]
    [string]$ProfileType = "average",  # Options: at_risk, high_performer, average
    
    [Parameter(Mandatory=$false)]
    [decimal]$AverageScore = 70.0
)

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      📊 INITIALISATION DONNÉES ÉTUDIANT               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🆔 Student ID   : $StudentId" -ForegroundColor Cyan
Write-Host "📈 Profil       : $ProfileType" -ForegroundColor Cyan
Write-Host "📊 Score moyen  : $AverageScore%" -ForegroundColor Cyan
Write-Host ""

# Définir les paramètres selon le profil
$params = @{}
switch ($ProfileType) {
    "at_risk" {
        $params = @{
            average_score = 35.0
            engagement_level = "Low"
            performance_trend = "Stable"
            total_time_spent = 8.5
            total_modules = 6
        }
    }
    "high_performer" {
        $params = @{
            average_score = 92.0
            engagement_level = "High"
            performance_trend = "Improving"
            total_time_spent = 45.0
            total_modules = 15
        }
    }
    default {  # average
        $params = @{
            average_score = [double]$AverageScore
            engagement_level = "Medium"
            performance_trend = "Stable"
            total_time_spent = 25.0
            total_modules = 10
        }
    }
}

Write-Host "🔍 Vérification des services..." -ForegroundColor Yellow

# Vérifier PrepaData
try {
    $prepadata = Invoke-RestMethod -Uri "http://localhost:3002/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ PrepaData API actif" -ForegroundColor Green
} catch {
    Write-Host "❌ PrepaData API non disponible" -ForegroundColor Red
    Write-Host "   Démarrez-le avec: docker-compose up -d prepa-data" -ForegroundColor Yellow
    exit 1
}

# Vérifier StudentProfiler
try {
    $profiler = Invoke-RestMethod -Uri "http://localhost:3003/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ StudentProfiler API actif" -ForegroundColor Green
} catch {
    Write-Host "❌ StudentProfiler API non disponible" -ForegroundColor Red
    Write-Host "   Démarrez-le avec: docker-compose up -d student-profiler" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Insertion des données dans PostgreSQL..." -ForegroundColor Yellow

# Insérer dans student_indicators (edupath_prepa)
$insertIndicators = @"
INSERT INTO student_indicators (student_id, average_score, engagement_level, performance_trend, total_time_spent, total_modules, created_at, updated_at)
VALUES ('$StudentId', $($params.average_score), '$($params.engagement_level)', '$($params.performance_trend)', $($params.total_time_spent), $($params.total_modules), NOW(), NOW())
ON CONFLICT (student_id) DO UPDATE SET
    average_score = $($params.average_score),
    engagement_level = '$($params.engagement_level)',
    performance_trend = '$($params.performance_trend)',
    total_time_spent = $($params.total_time_spent),
    total_modules = $($params.total_modules),
    updated_at = NOW();
"@

try {
    docker exec edupath-postgres psql -U edupath -d edupath_prepa -c $insertIndicators
    Write-Host "✅ Données insérées dans edupath_prepa" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'insertion dans edupath_prepa" -ForegroundColor Yellow
}

# Insérer dans student_profiles (edupath_profiler)
$insertProfile = @"
INSERT INTO student_profiles (student_id, profile_type, cluster_id, profile_confidence, created_at, updated_at)
VALUES ('$StudentId', '$ProfileType', 1, 0.85, NOW(), NOW())
ON CONFLICT (student_id) DO UPDATE SET
    profile_type = '$ProfileType',
    profile_confidence = 0.85,
    updated_at = NOW();
"@

try {
    docker exec edupath-postgres psql -U edupath -d edupath_profiler -c $insertProfile
    Write-Host "✅ Données insérées dans edupath_profiler" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'insertion dans edupath_profiler" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Redémarrage des services pour recharger les données..." -ForegroundColor Yellow
docker-compose restart prepa-data student-profiler student-coach-api

Write-Host ""
Write-Host "⏳ Attente du redémarrage (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Vérification des données..." -ForegroundColor Yellow

# Tester PrepaData
try {
    $features = Invoke-RestMethod -Uri "http://localhost:3002/features/$StudentId" -Method GET -ErrorAction Stop
    Write-Host "✅ PrepaData - Données chargées pour Student $StudentId" -ForegroundColor Green
    Write-Host "   Score: $($features.features.average_score)%" -ForegroundColor Cyan
    Write-Host "   Engagement: $($features.features.engagement_level)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ PrepaData - Données non chargées" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Yellow
}

# Tester StudentProfiler
try {
    $profile = Invoke-RestMethod -Uri "http://localhost:3003/profile/$StudentId" -Method GET -ErrorAction Stop
    Write-Host "✅ StudentProfiler - Profil chargé pour Student $StudentId" -ForegroundColor Green
    Write-Host "   Type: $($profile.profile.profile_type)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ StudentProfiler - Profil non chargé" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Yellow
}

# Tester StudentCoach Dashboard
try {
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3007/student/$StudentId/dashboard" -Method GET -ErrorAction Stop
    Write-Host "✅ StudentCoach - Dashboard accessible pour Student $StudentId" -ForegroundColor Green
    Write-Host "   Score: $($dashboard.dashboard.progress.average_score)%" -ForegroundColor Cyan
    Write-Host "   Profil: $($dashboard.dashboard.profile.profile_type)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ StudentCoach - Dashboard non accessible" -ForegroundColor Red
    Write-Host "   Erreur: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "      INITIALISATION TERMINEE                        " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Student $StudentId peut maintenant se connecter" -ForegroundColor Green
Write-Host "Les donnees seront visibles dans le dashboard" -ForegroundColor Cyan
Write-Host ""
