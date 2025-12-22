# 📧 Configuration de l'envoi d'emails

## Problème actuel

L'envoi d'email ne fonctionne pas actuellement parce que le système est en **mode simulation** par défaut. Pour activer l'envoi réel d'emails, vous devez configurer les paramètres SMTP.

## Solution : Configurer Outlook/Office365

### Étape 1 : Éditer le fichier `.env`

Le fichier `.env` a déjà été créé dans `services/auth-service/.env` avec cette configuration :

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=Hassane.Guedad@emsi-edu.ma
SMTP_PASSWORD=votre-mot-de-passe-outlook
SMTP_FROM=Hassane.Guedad@emsi-edu.ma
```

### Étape 2 : Ajouter votre mot de passe réel

1. Ouvrez le fichier `services/auth-service/.env`
2. Remplacez `votre-mot-de-passe-outlook` par votre **vrai mot de passe Outlook**
3. Sauvegardez le fichier

**Exemple :**
```env
SMTP_PASSWORD=VotreMotDePasse123!
```

### Étape 3 : Redémarrer le service

Depuis le dossier `EduPath-MS-EMSI`, exécutez :

```bash
docker-compose restart auth-service
```

Ou pour reconstruire complètement :

```bash
docker-compose up -d --build auth-service
```

## Vérification

Après le redémarrage :

1. Allez sur http://localhost:3006/students
2. Créez un étudiant
3. ☑️ Cochez "📧 Envoyer les identifiants par email"
4. Soumettez le formulaire
5. Vérifiez votre boîte mail (et spam) pour confirmer la réception

### Vérifier les logs

Pour voir les logs du service d'authentification :

```bash
docker logs edupath-auth-service --tail 50
```

Vous devriez voir :
- `✅ Email envoyé avec succès à ...` si ça marche
- `❌ Erreur lors de l'envoi de l'email ...` si ça échoue (avec détails)

## Problèmes courants

### 1. Email pas reçu
- Vérifiez le dossier **spam/courrier indésirable**
- Vérifiez que le mot de passe dans `.env` est correct
- Assurez-vous d'avoir redémarré le service après modification

### 2. Erreur "535 Authentication Failed"
- Le mot de passe est incorrect
- Vérifiez que vous utilisez le bon mot de passe Outlook

### 3. Erreur "Connection refused"
- Vérifiez que `SMTP_HOST` et `SMTP_PORT` sont corrects
- Pour Outlook : `smtp.office365.com` et port `587`

### 4. Erreur "554 Relay denied"
- `SMTP_FROM` doit être identique à `SMTP_USER`
- Dans votre cas : `Hassane.Guedad@emsi-edu.ma`

## Configuration alternative (Gmail)

Si Outlook ne fonctionne pas, vous pouvez utiliser Gmail :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=votre-email@gmail.com
```

**Note :** Gmail nécessite un [mot de passe d'application](https://support.google.com/accounts/answer/185833) (pas votre mot de passe habituel).

## Mode simulation (par défaut)

Si vous ne configurez pas les paramètres SMTP, le système fonctionne en **mode simulation** :
- Les emails ne sont pas réellement envoyés
- Les informations sont affichées dans les logs Docker
- L'interface affiche toujours les identifiants créés
- Vous pouvez toujours exporter la liste en PDF

Ce mode est utile pour le développement et les tests.

## Résumé des modifications récentes

✅ **Ajouté** : Checkbox pour envoyer l'email lors de la création
✅ **Ajouté** : Service d'envoi d'emails (aiosmtplib)
✅ **Ajouté** : Template HTML professionnel pour les emails
✅ **Ajouté** : Indicateur visuel si l'email a été envoyé
✅ **Ajouté** : Configuration SMTP dans `.env`
✅ **Ajouté** : Boutons Modifier/Supprimer pour gérer les étudiants
