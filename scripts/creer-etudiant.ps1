# Script pour créer un nouveau compte étudiant avec student_id
# Usage: .\creer-etudiant.ps1 -Email "etudiant@email.com" -FullName "Nom Complet" [-StudentId 12400] -Password "motdepasse"
# Si StudentId n'est pas fourni, le script génère automatiquement le prochain disponible

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$FullName,
    
    [Parameter(Mandatory=$false)]
    [int]$StudentId = 0,
    
    [Parameter(Mandatory=$false)]
    [string]$Password = "student123",
    
    [Parameter(Mandatory=$false)]
    [string]$FirstName = "",
    
    [Parameter(Mandatory=$false)]
    [string]$LastName = ""
)

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      📝 CRÉATION NOUVEAU COMPTE ÉTUDIANT              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Auto-générer StudentId si non fourni
if ($StudentId -eq 0) {
    Write-Host "🔄 Génération automatique du Student ID..." -ForegroundColor Yellow
    try {
        $maxIdQuery = docker exec edupath-postgres psql -U edupath -d edupath_auth -t -c "SELECT COALESCE(MAX(student_id), 12399) FROM users;" 2>&1
        $maxId = [int]($maxIdQuery -replace '\s', '')
        $StudentId = $maxId + 1
        Write-Host "✅ Student ID généré : $StudentId" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la génération du Student ID" -ForegroundColor Red
        Write-Host "   Utilisez -StudentId pour spécifier manuellement" -ForegroundColor Yellow
        exit 1
    }
}

# Extraire prénom et nom si pas fournis
if ([string]::IsNullOrEmpty($FirstName) -and [string]::IsNullOrEmpty($LastName)) {
    $nameParts = $FullName -split ' ', 2
    if ($nameParts.Length -eq 2) {
        $FirstName = $nameParts[0]
        $LastName = $nameParts[1]
    } else {
        $FirstName = $FullName
        $LastName = ""
    }
}

Write-Host "📧 Email        : $Email" -ForegroundColor Cyan
Write-Host "👤 Nom complet  : $FullName" -ForegroundColor Cyan
Write-Host "🆔 Student ID   : $StudentId" -ForegroundColor Cyan
Write-Host "🔒 Mot de passe : $Password" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le service auth est actif
Write-Host "🔍 Vérification du service Auth..." -ForegroundColor Yellow
try {
    $authCheck = Invoke-RestMethod -Uri "http://localhost:3008/docs" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Service Auth actif" -ForegroundColor Green
} catch {
    Write-Host "❌ Service Auth non accessible. Démarrez-le avec: docker-compose up -d auth-service" -ForegroundColor Red
    exit 1
}

# Vérifier si le student_id est déjà utilisé
Write-Host "`n🔍 Vérification du Student ID..." -ForegroundColor Yellow
$checkId = docker exec -it edupath-postgres psql -U edupath -d edupath_auth -t -c "SELECT COUNT(*) FROM users WHERE student_id = $StudentId;"
$idCount = ($checkId -replace '\D+', '').Trim()

if ([int]$idCount -gt 0) {
    Write-Host "⚠️  ATTENTION: Le Student ID $StudentId est déjà utilisé !" -ForegroundColor Red
    $continue = Read-Host "Voulez-vous continuer quand même ? (o/n)"
    if ($continue -ne "o") {
        Write-Host "❌ Opération annulée" -ForegroundColor Red
        exit 1
    }
}

# Vérifier si l'email existe déjà
Write-Host "`n🔍 Vérification de l'email..." -ForegroundColor Yellow
$checkEmail = docker exec -it edupath-postgres psql -U edupath -d edupath_auth -t -c "SELECT COUNT(*) FROM users WHERE email = '$Email';"
$emailCount = ($checkEmail -replace '\D+', '').Trim()

if ([int]$emailCount -gt 0) {
    Write-Host "⚠️  ATTENTION: L'email $Email existe déjà !" -ForegroundColor Red
    Write-Host "📝 Mise à jour du compte existant..." -ForegroundColor Yellow
    
    # Générer le hash du mot de passe
    $passwordHash = docker exec -it edupath-auth-service python -c "from src.utils.password import get_password_hash; import sys; sys.stdout.write(get_password_hash('$Password'))"
    
    # Mettre à jour le compte
    $updateSql = "UPDATE users SET full_name = '$FullName', first_name = '$FirstName', last_name = '$LastName', student_id = $StudentId, password_hash = '$passwordHash', is_active = true WHERE email = '$Email';"
    docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c $updateSql
    
    Write-Host "✅ Compte mis à jour avec succès !" -ForegroundColor Green
} else {
    Write-Host "✅ Email disponible" -ForegroundColor Green
    
    # Créer le compte via l'API
    Write-Host "`n📝 Création du compte..." -ForegroundColor Yellow
    
    $body = @{
        email = $Email
        password = $Password
        full_name = $FullName
        first_name = $FirstName
        last_name = $LastName
        student_id = $StudentId
        role = "student"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3008/auth/register" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "✅ Compte créé avec succès !" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la création du compte : $_" -ForegroundColor Red
        Write-Host "`n🔧 Tentative de création directe dans la base de données..." -ForegroundColor Yellow
        
        # Générer le hash du mot de passe
        $passwordHash = docker exec -it edupath-auth-service python -c "from src.utils.password import get_password_hash; import sys; sys.stdout.write(get_password_hash('$Password'))"
        
        # Insérer directement dans la base
        $insertSql = "INSERT INTO users (email, password_hash, full_name, first_name, last_name, student_id, role, is_active) VALUES ('$Email', '$passwordHash', '$FullName', '$FirstName', '$LastName', $StudentId, 'student', true);"
        
        docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c $insertSql
        Write-Host "✅ Compte créé directement dans la base de données !" -ForegroundColor Green
    }
}

# Vérifier la création
Write-Host "`n🔍 Vérification du compte créé..." -ForegroundColor Yellow
$verification = docker exec -it edupath-postgres psql -U edupath -d edupath_auth -c "SELECT id, email, full_name, student_id, role, is_active FROM users WHERE email = '$Email';"
Write-Host $verification

# Test de connexion
Write-Host "`n🧪 Test de connexion..." -ForegroundColor Yellow
try {
    $loginBody = @{
        username = $Email
        password = $Password
    }
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3008/auth/login" `
        -Method POST `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $loginBody `
        -ErrorAction Stop
    
    Write-Host "✅ Connexion réussie ! Token JWT généré." -ForegroundColor Green
    Write-Host "🎫 Token: $($loginResponse.access_token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Test de connexion échoué : $_" -ForegroundColor Yellow
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║      ✅ COMPTE CRÉÉ AVEC SUCCÈS                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📋 INFORMATIONS DE CONNEXION :" -ForegroundColor Yellow
Write-Host "   📧 Email       : $Email" -ForegroundColor Cyan
Write-Host "   🔒 Mot de passe: $Password" -ForegroundColor Cyan
Write-Host "   🆔 Student ID  : $StudentId" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 L'étudiant peut maintenant se connecter à :" -ForegroundColor Green
Write-Host "   📱 Application Flutter (Chrome)" -ForegroundColor White
Write-Host "   🌐 Student Portal: http://localhost:3009" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  NOTE IMPORTANTE :" -ForegroundColor Yellow
Write-Host "   Le Student ID $StudentId doit avoir des données dans PrepaData" -ForegroundColor White
Write-Host "   pour que le dashboard affiche des informations." -ForegroundColor White
Write-Host "   Sinon, le dashboard sera vide (mais fonctionnel)." -ForegroundColor White
Write-Host ""
