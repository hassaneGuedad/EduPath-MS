# Script pour effacer la session Flutter (pour tester l'écran de connexion)

Write-Host "`n🔄 Effacement de la session Flutter..." -ForegroundColor Yellow

# Emplacement du stockage local de Flutter Web (Chrome)
$chromeData = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
$edgeData = "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default"

Write-Host "`n📂 Emplacements à vérifier :" -ForegroundColor Cyan
Write-Host "  - Chrome: $chromeData"
Write-Host "  - Edge: $edgeData"

Write-Host "`n⚠️  MÉTHODES POUR EFFACER LA SESSION :" -ForegroundColor Yellow

Write-Host "`n🔧 Méthode 1 : Utiliser le bouton de déconnexion (RECOMMANDÉ)" -ForegroundColor Green
Write-Host "  1. Dans l'application Flutter, cliquez sur l'icône de déconnexion (en haut à droite)"
Write-Host "  2. Confirmez la déconnexion"
Write-Host "  3. Vous serez redirigé vers l'écran de connexion"

Write-Host "`n🔧 Méthode 2 : Ouvrir DevTools Chrome" -ForegroundColor Green
Write-Host "  1. Dans Chrome, appuyez sur F12 pour ouvrir DevTools"
Write-Host "  2. Allez dans l'onglet 'Application'"
Write-Host "  3. Dans le menu de gauche, cliquez sur 'Local Storage'"
Write-Host "  4. Sélectionnez 'http://localhost:...'"
Write-Host "  5. Supprimez les clés : 'flutter.auth_token', 'flutter.student_id', 'flutter.user_email'"
Write-Host "  6. Rechargez la page (F5)"

Write-Host "`n🔧 Méthode 3 : Effacer tout le stockage Chrome" -ForegroundColor Yellow
Write-Host "  1. Chrome > Paramètres > Confidentialité et sécurité"
Write-Host "  2. Effacer les données de navigation"
Write-Host "  3. Cocher 'Cookies et autres données de sites'"
Write-Host "  4. Période : 'Dernière heure'"
Write-Host "  5. Effacer les données"

Write-Host "`n🔧 Méthode 4 : Mode navigation privée" -ForegroundColor Green
Write-Host "  1. Fermez l'application Flutter (Ctrl+C dans le terminal)"
Write-Host "  2. Ouvrez Chrome en mode navigation privée (Ctrl+Shift+N)"
Write-Host "  3. Relancez Flutter : flutter run -d chrome"
Write-Host "  4. L'écran de connexion s'affichera (pas de session sauvegardée)"

Write-Host "`n🔧 Méthode 5 : Forcer l'écran de connexion via code" -ForegroundColor Cyan
Write-Host "  Dans le fichier lib/main.dart, vous pouvez temporairement forcer :"
Write-Host "  - Remplacer : if (snapshot.data == true) {"
Write-Host "  - Par      : if (false) {"
Write-Host "  - Cela forcera toujours l'écran de connexion"

Write-Host "`n✅ SOLUTION IMPLÉMENTÉE :" -ForegroundColor Green
Write-Host "  Un bouton de déconnexion a été ajouté en haut à droite du dashboard !"
Write-Host "  Cliquez dessus pour vous déconnecter et tester un autre compte."

Write-Host "`n📱 Pour tester les différents comptes :" -ForegroundColor Yellow
Write-Host "  1. Cliquez sur l'icône de déconnexion en haut à droite"
Write-Host "  2. Vous serez redirigé vers l'écran de connexion"
Write-Host "  3. Connectez-vous avec un compte différent :"
Write-Host ""
Write-Host "     mohamed.alami@emsi-edu.ma   / student123  (At Risk)"
Write-Host "     fatima.benali@emsi-edu.ma   / student123  (High Performer)"
Write-Host "     youssef.kadiri@emsi-edu.ma  / student123  (Average)"

Write-Host "`n🔄 Rechargez l'application Flutter maintenant :" -ForegroundColor Cyan
Write-Host "  Dans le terminal Flutter, appuyez sur 'R' (Hot Restart)" -ForegroundColor Green
Write-Host "  Ou appuyez sur 'r' (Hot Reload)" -ForegroundColor Green

Write-Host ""
