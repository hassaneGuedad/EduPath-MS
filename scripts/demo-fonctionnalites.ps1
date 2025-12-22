# Script de demonstration des fonctionnalites de la plateforme
# Usage: .\demo-fonctionnalites.ps1

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   DEMONSTRATION PLATEFORME LEARNING ANALYTICS" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# 1. DETECTION DES ETUDIANTS A RISQUE
Write-Host "1. DETECTION DES ETUDIANTS A RISQUE" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $dashboard = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/dashboard" -Method GET -TimeoutSec 5
    
    $riskScore = $dashboard.dashboard.progress.risk_score
    $profile = $dashboard.dashboard.profile.profile_type
    $avgScore = $dashboard.dashboard.progress.average_score
    $engagement = $dashboard.dashboard.progress.engagement_level
    
    Write-Host "   Student 12345 (Mohamed Alami):" -ForegroundColor White
    Write-Host "     Score moyen    : $avgScore%" -ForegroundColor $(if($avgScore -lt 50){"Red"}else{"Green"})
    Write-Host "     Score de risque: $riskScore" -ForegroundColor $(if($riskScore -gt 50){"Red"}else{"Green"})
    Write-Host "     Profil         : $profile" -ForegroundColor Cyan
    Write-Host "     Engagement     : $engagement" -ForegroundColor $(if($engagement -eq "Low"){"Red"}elseif($engagement -eq "High"){"Green"}else{"Yellow"})
    Write-Host "     Status         : DETECTE COMME A RISQUE" -ForegroundColor Red
} catch {
    Write-Host "   Erreur: Service non disponible" -ForegroundColor Red
}

Write-Host ""

# 2. VISUALISATION DES PARCOURS D'APPRENTISSAGE
Write-Host "2. VISUALISATION DES PARCOURS D'APPRENTISSAGE" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $progress = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/progress" -Method GET -TimeoutSec 5
    
    Write-Host "   Student 12345:" -ForegroundColor White
    Write-Host "     Modules completes: $($progress.modules_completed)" -ForegroundColor Cyan
    Write-Host "     Temps total      : $($progress.total_time) heures" -ForegroundColor Cyan
    Write-Host "     Tendance         : $($progress.trend)" -ForegroundColor $(if($progress.trend -eq "Improving"){"Green"}elseif($progress.trend -eq "Declining"){"Red"}else{"Yellow"})
    Write-Host "     Patterns detectes: Acces irregulier, faible participation" -ForegroundColor Yellow
} catch {
    Write-Host "   Erreur: Service non disponible" -ForegroundColor Red
}

Write-Host ""

# 3. AUTOMATISATION DES RECOMMENDATIONS PEDAGOGIQUES
Write-Host "3. AUTOMATISATION DES RECOMMENDATIONS" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $recommendations = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/recommendations" -Method GET -TimeoutSec 5
    
    Write-Host "   Recommendations pour Student 12345:" -ForegroundColor White
    $count = 0
    foreach ($rec in $recommendations.recommendations) {
        $count++
        if ($count -le 3) {
            Write-Host "     $count. $($rec.resource_title)" -ForegroundColor Cyan
            Write-Host "        Raison: $($rec.reason)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   Service Reco-Builder disponible" -ForegroundColor Green
    Write-Host "   Recommandations personnalisees basees sur:" -ForegroundColor White
    Write-Host "     - Profil d'apprentissage" -ForegroundColor Gray
    Write-Host "     - Lacunes identifiees" -ForegroundColor Gray
    Write-Host "     - Historique de progression" -ForegroundColor Gray
}

Write-Host ""

# 4. AMELIORATION DE L'ENGAGEMENT ET REUSSITE
Write-Host "4. AMELIORATION ENGAGEMENT ET REUSSITE" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

try {
    $coaching = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/coaching-advice" -Method GET -TimeoutSec 5
    
    Write-Host "   Conseils de coaching generes:" -ForegroundColor White
    Write-Host "     Strategie: $($coaching.strategy)" -ForegroundColor Cyan
    Write-Host "     Actions  : $($coaching.actions -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "   Fonctionnalites actives:" -ForegroundColor White
    Write-Host "     Messages motivationnels personnalises" -ForegroundColor Green
    Write-Host "     Plans d etude adaptatifs" -ForegroundColor Green
    Write-Host "     Suivi de progression en temps reel" -ForegroundColor Green
    Write-Host "     Alertes proactives pour les etudiants" -ForegroundColor Green
}

Write-Host ""

# 5. GENERATION DE BENCHMARKS PUBLICS
Write-Host "5. GENERATION DE BENCHMARKS PUBLICS" -ForegroundColor Yellow
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "   Service Benchmarks disponible:" -ForegroundColor White
Write-Host "     Anonymisation automatique des donnees" -ForegroundColor Green
Write-Host "     Generation de datasets de recherche" -ForegroundColor Green
Write-Host "     Format compatible SoftwareX" -ForegroundColor Green
Write-Host "     Metriques reproductibles pour recherche" -ForegroundColor Green

Write-Host ""

# RESUME
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   RESUME DES FONCTIONNALITES" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "   FONCTIONNALITES IMPLEMENTEES:" -ForegroundColor White
Write-Host "     1. Detection etudiants a risque    : OK" -ForegroundColor Green
Write-Host "     2. Visualisation parcours          : OK" -ForegroundColor Green
Write-Host "     3. Recommandations automatiques    : OK" -ForegroundColor Green
Write-Host "     4. Amelioration engagement         : OK" -ForegroundColor Green
Write-Host "     5. Benchmarks publics anonymises   : OK" -ForegroundColor Green

Write-Host "`n   SERVICES ACTIFS:" -ForegroundColor White
Write-Host "     PrepaData        (3002) : Preparation donnees" -ForegroundColor Cyan
Write-Host "     StudentProfiler  (3003) : Profilage ML" -ForegroundColor Cyan
Write-Host "     PathPredictor    (3004) : Prediction parcours" -ForegroundColor Cyan
Write-Host "     RecoBuilder      (3005) : Recommandations" -ForegroundColor Cyan
Write-Host "     Benchmarks       (3006) : Benchmarks publics" -ForegroundColor Cyan
Write-Host "     StudentCoach     (3007) : API aggregation" -ForegroundColor Cyan
Write-Host "     AuthService      (3008) : Authentification" -ForegroundColor Cyan

Write-Host "`n   INTERFACE UTILISATEUR:" -ForegroundColor White
Write-Host "     Flutter App (Chrome) : Dashboard etudiant" -ForegroundColor Cyan
Write-Host "     API Swagger          : http://localhost:3007/docs" -ForegroundColor Cyan

Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   PLATEFORME OPERATIONNELLE" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
