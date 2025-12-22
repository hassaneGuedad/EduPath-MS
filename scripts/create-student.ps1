# Script PowerShell pour créer un compte étudiant

$body = @{
    email = "student@edupath.com"
    password = "student123"
    full_name = "Student User"
    role = "student"
} | ConvertTo-Json

Write-Host "Création d'un compte étudiant..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ Compte créé avec succès!" -ForegroundColor Green
    Write-Host "Email: student@edupath.com" -ForegroundColor Cyan
    Write-Host "Password: student123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant vous connecter sur http://localhost:3009" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠️  Le compte existe déjà!" -ForegroundColor Yellow
        Write-Host "Email: student@edupath.com" -ForegroundColor Cyan
        Write-Host "Password: student123" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur: $_" -ForegroundColor Red
    }
}

