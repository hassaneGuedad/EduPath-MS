# Guide de Test - StudentCoach API

## Prérequis
- API démarrée sur http://localhost:3007
- Base de données PostgreSQL initialisée
- Services PrepaData, StudentProfiler actifs

## Tests PowerShell (Windows)

### 1. Test Message Motivant
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/motivational-message"
Write-Host "Message: $($response.message)" -ForegroundColor Green
Write-Host "Profil: $($response.profile)" -ForegroundColor Cyan
Write-Host "Score: $($response.score)" -ForegroundColor Yellow
```

### 2. Test Conseils de Coaching
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/coaching-advice"
Write-Host "Nombre de conseils: $($response.count)" -ForegroundColor Cyan
foreach ($advice in $response.advice) {
    Write-Host "`n$($advice.icon) $($advice.title)" -ForegroundColor Yellow
    Write-Host "   $($advice.advice)" -ForegroundColor White
    Write-Host "   Action: $($advice.action)" -ForegroundColor Green
}
```

### 3. Test Plan d'Étude
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/study-plan"
$plan = $response.study_plan
Write-Host "Durée quotidienne: $($plan.duration_per_day) minutes" -ForegroundColor Cyan
Write-Host "Sessions par semaine: $($plan.weekly_sessions)" -ForegroundColor Cyan
Write-Host "`nPriorités:" -ForegroundColor Yellow
$plan.priorities | ForEach-Object { Write-Host "  - $_" }
```

### 4. Test Coaching Complet
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/complete-coaching"
$coaching = $response.coaching

Write-Host "`n💬 MESSAGE MOTIVANT:" -ForegroundColor Green
Write-Host $coaching.motivational_message

Write-Host "`n📚 CONSEILS ($($coaching.advice.Count)):" -ForegroundColor Yellow
foreach ($a in $coaching.advice) {
    Write-Host "`n$($a.icon) $($a.title)" -ForegroundColor Cyan
    Write-Host "  $($a.advice)"
}

Write-Host "`n📅 PLAN D'ÉTUDE:" -ForegroundColor Magenta
Write-Host "  $($coaching.study_plan.duration_per_day) min/jour - $($coaching.study_plan.weekly_sessions) sessions/semaine"
```

### 5. Test Feedback
```powershell
$body = @{
    feedback_text = "Les conseils sont très utiles !"
    rating = 5
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/feedback" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ $($response.message)" -ForegroundColor Green
```

### 6. Test Évaluation Recommandation
```powershell
$body = @{
    resource_name = "Tutoriel Python Basics"
    rating = 4
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/rate-recommendation" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

Write-Host "✅ Note enregistrée: $($response.rating)/5" -ForegroundColor Green
```

### 7. Test Historique
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/coaching-history?limit=5"
Write-Host "Nombre de sessions: $($response.count)" -ForegroundColor Cyan

foreach ($session in $response.history) {
    Write-Host "`n📅 $($session.session_date)" -ForegroundColor Yellow
    if ($session.message_sent) {
        Write-Host "  Message: $($session.message_sent.Substring(0, [Math]::Min(50, $session.message_sent.Length)))..."
    }
    if ($session.rating) {
        Write-Host "  Note: $($session.rating)/5" -ForegroundColor Green
    }
}
```

### 8. Test Dashboard Complet
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3007/student/12345/dashboard"
$dash = $response.dashboard

Write-Host "`n📊 DASHBOARD COMPLET" -ForegroundColor Magenta
Write-Host "Score: $($dash.progress.average_score)" -ForegroundColor Cyan
Write-Host "Profil: $($dash.profile.profile_name)" -ForegroundColor Yellow
Write-Host "Risque: $($dash.prediction.risk_level)" -ForegroundColor Red
Write-Host "Recommandations: $($dash.recommendations.Count)" -ForegroundColor Green
```

## Tests Bash (Linux/Mac)

### Message Motivant
```bash
curl -X GET "http://localhost:3007/student/12345/motivational-message" | jq '.'
```

### Conseils de Coaching
```bash
curl -X GET "http://localhost:3007/student/12345/coaching-advice" | jq '.advice[]'
```

### Feedback
```bash
curl -X POST "http://localhost:3007/student/12345/feedback" \
  -H "Content-Type: application/json" \
  -d '{"feedback_text": "Très utile!", "rating": 5}'
```

### Coaching Complet
```bash
curl -X GET "http://localhost:3007/student/12345/complete-coaching" | jq '{
  message: .coaching.motivational_message,
  advice_count: (.coaching.advice | length),
  study_duration: .coaching.study_plan.duration_per_day
}'
```

## Vérification Base de Données

### Vérifier les messages motivants
```sql
SELECT COUNT(*) FROM motivational_messages;
SELECT profile_type, score_range, COUNT(*) 
FROM motivational_messages 
GROUP BY profile_type, score_range;
```

### Vérifier les sessions de coaching
```sql
SELECT student_id, COUNT(*) as sessions, AVG(rating) as avg_rating
FROM student_coaching_sessions
GROUP BY student_id;
```

### Voir les dernières sessions
```sql
SELECT * FROM recent_coaching_activity LIMIT 10;
```

## Tests avec Différents Profils

### Étudiant "At Risk" (score bas)
```powershell
# Student 12345 (37.67% - At Risk)
Invoke-RestMethod "http://localhost:3007/student/12345/motivational-message"
```

### Étudiant "High Performer" (score élevé)
```powershell
# Student 12346 (95% - High Performer)
Invoke-RestMethod "http://localhost:3007/student/12346/motivational-message"
```

### Étudiant "Average Learner" (score moyen)
```powershell
# Student 12347 (70% - Average Learner)
Invoke-RestMethod "http://localhost:3007/student/12347/motivational-message"
```

## Résultats Attendus

✅ **Messages motivants** : Différents selon le profil et le score
✅ **Conseils** : 2-5 conseils personnalisés avec actions concrètes
✅ **Plan d'étude** : Durée et fréquence adaptées au niveau
✅ **Feedback** : Enregistré dans PostgreSQL
✅ **Historique** : Liste des sessions précédentes
✅ **Dashboard** : Agrégation de toutes les données

## Documentation Interactive

Accédez à la documentation Swagger :
```
http://localhost:3007/docs
```

Testez tous les endpoints directement depuis l'interface !
