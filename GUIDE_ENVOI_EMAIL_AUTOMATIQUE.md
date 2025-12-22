# 📧 Guide d'Envoi Automatique des Identifiants par Email

## Vue d'ensemble

Cette fonctionnalité permet aux professeurs d'envoyer automatiquement les identifiants de connexion (email + mot de passe temporaire) directement à l'adresse email de l'étudiant lors de la création du compte.

## 🎯 Objectif

Automatiser la distribution des identifiants pour gagner du temps et éviter les erreurs de communication manuelle.

## ✨ Fonctionnalités

### 1. **Checkbox dans le formulaire de création**

Lors de la création d'un compte étudiant, le professeur peut cocher :
```
☑️ Envoyer les identifiants par email à l'étudiant
```

- **Par défaut** : Décochée (comportement classique)
- **Si cochée** : Email automatique envoyé à l'adresse de l'étudiant
- **Si décochée** : Le prof doit communiquer manuellement les identifiants

### 2. **Email professionnel automatique**

L'étudiant reçoit un email contenant :

#### En-tête
```
🎓 EduPath
Plateforme d'apprentissage personnalisée
```

#### Message personnalisé
```
Bonjour [Nom de l'étudiant],

Bienvenue sur EduPath ! Votre compte a été créé avec succès.

📧 VOS IDENTIFIANTS DE CONNEXION :
Email : hassane.guedad@emsi-edu.ma
Mot de passe temporaire : [12 caractères aléatoires]
```

#### Avertissements
```
⚠️ IMPORTANT :
- Ce mot de passe est temporaire
- Vous devez le changer lors de votre première connexion
- Ne partagez jamais vos identifiants
```

#### Instructions de connexion
```
COMMENT SE CONNECTER :
1. Visitez : http://localhost:3009
2. Entrez votre email et mot de passe temporaire
3. Allez dans Paramètres (⚙️) pour changer votre mot de passe
```

### 3. **Confirmation visuelle**

Après création du compte, si l'email a été envoyé :

**Modal de succès affiche** :
```
✅ Compte créé avec succès !

📧 Email envoyé !
Les identifiants ont été envoyés automatiquement à hassane.guedad@emsi-edu.ma
```

**Liste de session** :
Une indication visuelle montre si l'email a été envoyé pour chaque compte créé.

## 🔧 Configuration SMTP

### Mode par défaut (Simulation)

Par défaut, les emails sont **simulés** et affichés dans les logs du serveur :
```
📧 [SIMULATION] Email envoyé à hassane.guedad@emsi-edu.ma
   Mot de passe: AbC123xYz456
```

**Avantages** :
- ✅ Fonctionne immédiatement sans configuration
- ✅ Aucune dépendance externe
- ✅ Parfait pour le développement et les tests
- ✅ Pas de risque d'envoi accidentel

### Mode production (Envoi réel)

Pour activer l'envoi réel d'emails, configurez les variables d'environnement SMTP.

#### Étape 1 : Copier le fichier de configuration

```bash
cd services/auth-service
cp .env.example .env
```

#### Étape 2 : Configurer le serveur SMTP

Éditez le fichier `.env` :

**Pour Gmail** :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-application
SMTP_FROM=noreply@edupath.edu
```

**Pour Outlook** :
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=votre-email@outlook.com
SMTP_PASSWORD=votre-mot-de-passe
SMTP_FROM=noreply@edupath.edu
```

**Pour SendGrid** :
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=votre-cle-api-sendgrid
SMTP_FROM=noreply@edupath.edu
```

#### Étape 3 : Redémarrer le service

```bash
docker-compose restart auth-service
```

### Configuration Gmail (Recommandé pour tests)

#### 1. Activer la validation en 2 étapes
- Allez dans : https://myaccount.google.com/security
- Activez "Validation en 2 étapes"

#### 2. Créer un mot de passe d'application
- Allez dans : https://myaccount.google.com/apppasswords
- Sélectionnez "Autre (nom personnalisé)"
- Tapez "EduPath"
- Cliquez sur "Générer"
- Copiez le mot de passe généré (16 caractères)

#### 3. Utiliser dans .env
```env
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=le-mot-de-passe-genere-sans-espaces
```

⚠️ **N'utilisez JAMAIS votre mot de passe Gmail principal !**

## 📋 Workflow complet

### Scénario 1 : Envoi automatique activé

```
1. Prof ouvre http://localhost:3006/students
   ↓
2. Clique sur "➕ Créer un étudiant"
   ↓
3. Remplit le formulaire :
   - Email : hassane.guedad@emsi-edu.ma
   - Prénom : Hassane
   - Nom : Guedad
   ↓
4. ☑️ Coche "Envoyer les identifiants par email"
   ↓
5. Clique sur "🔐 Créer le compte"
   ↓
6. Système :
   - Crée le compte
   - Génère mot de passe : AbC123xYz456
   - Envoie l'email automatiquement
   ↓
7. Prof voit :
   ✅ "Compte créé et email envoyé à hassane.guedad@emsi-edu.ma"
   ↓
8. Étudiant reçoit l'email dans sa boîte
   ↓
9. Étudiant se connecte avec les identifiants
   ↓
10. Étudiant change son mot de passe
```

### Scénario 2 : Distribution manuelle

```
1. Prof ouvre http://localhost:3006/students
   ↓
2. Crée le compte SANS cocher l'envoi automatique
   ↓
3. Système affiche le mot de passe temporaire
   ↓
4. Prof clique sur "📋 Copier les identifiants"
   ↓
5. Prof communique manuellement :
   - Par SMS
   - En personne
   - Via messagerie sécurisée
```

## 🎨 Format de l'email

### Version HTML (par défaut)

Email moderne et responsive avec :
- 🎨 Design EduPath (vert #27ae60)
- 📦 Sections bien délimitées
- 🔒 Mot de passe en évidence
- 🔗 Bouton de connexion direct
- ⚠️ Avertissements de sécurité
- 📝 Instructions étape par étape

### Version Texte Brut (fallback)

Pour les clients email qui ne supportent pas HTML :
```
Bonjour Hassane Guedad,

Bienvenue sur EduPath ! Votre compte a été créé avec succès.

VOS IDENTIFIANTS DE CONNEXION :
================================
Email : hassane.guedad@emsi-edu.ma
Mot de passe temporaire : AbC123xYz456

⚠️ IMPORTANT :
- Ce mot de passe est temporaire
- Vous devez le changer lors de votre première connexion
- Ne partagez jamais vos identifiants

COMMENT SE CONNECTER :
1. Visitez : http://localhost:3009
2. Entrez votre email et mot de passe temporaire
3. Allez dans Paramètres (⚙️) pour changer votre mot de passe

Besoin d'aide ? Contactez votre professeur.

---
EduPath - Plateforme d'apprentissage personnalisée
```

## 🔒 Sécurité

### Bonnes pratiques

✅ **À FAIRE** :
- Utiliser un mot de passe d'application (pas le mot de passe principal)
- Configurer SMTP_USER et SMTP_PASSWORD en variables d'environnement
- Ne JAMAIS commiter le fichier `.env` dans Git
- Utiliser TLS/STARTTLS (port 587)
- Limiter les tentatives d'envoi en cas d'échec

❌ **À NE PAS FAIRE** :
- Stocker les mots de passe SMTP en dur dans le code
- Utiliser le port 25 (non sécurisé)
- Partager le fichier `.env` publiquement
- Utiliser le mot de passe principal du compte email

### Protection des données

L'email contient :
- ✅ Mot de passe temporaire (sera changé par l'étudiant)
- ✅ Instructions de sécurité
- ✅ Avertissement de changement obligatoire

L'email NE contient PAS :
- ❌ Informations bancaires
- ❌ Numéros de sécurité sociale
- ❌ Mot de passe permanent

### Gestion des erreurs

Si l'envoi d'email échoue :
- ⚠️ Le compte est QUAND MÊME créé
- ⚠️ Le professeur est informé que l'email n'a pas été envoyé
- ⚠️ Le professeur peut communiquer manuellement les identifiants
- ⚠️ L'erreur est loggée pour diagnostic

**Exemple de message** :
```
✅ Compte créé avec succès !
❌ Impossible d'envoyer l'email automatiquement.
Veuillez communiquer les identifiants manuellement.
```

## 📊 Suivi et logs

### Logs serveur (auth-service)

En mode **simulation** :
```
📧 [SIMULATION] Email envoyé à hassane.guedad@emsi-edu.ma
   Mot de passe: AbC123xYz456
```

En mode **production** (succès) :
```
✅ Email envoyé avec succès à hassane.guedad@emsi-edu.ma
```

En mode **production** (échec) :
```
❌ Erreur lors de l'envoi de l'email à hassane.guedad@emsi-edu.ma: 
   [Détails de l'erreur SMTP]
```

### Vérification côté professeur

Le professeur peut voir dans l'interface :
1. **Modal de confirmation** : Indication si email envoyé
2. **Liste de session** : Badge "Email envoyé" pour chaque compte
3. **Export PDF** : Colonne indiquant le statut d'envoi

## 🆘 Dépannage

### L'email n'est pas reçu

**Vérifications** :
1. ✅ Vérifier les logs du serveur
2. ✅ Vérifier le dossier spam de l'étudiant
3. ✅ Vérifier que l'adresse email est correcte
4. ✅ Vérifier la configuration SMTP
5. ✅ Tester avec un autre compte email

**Si en mode simulation** :
- Les emails ne sont PAS vraiment envoyés
- Configurez SMTP pour activer l'envoi réel

### Erreur "Authentication failed"

**Cause** : Identifiants SMTP incorrects

**Solutions** :
1. Vérifier SMTP_USER et SMTP_PASSWORD dans `.env`
2. Pour Gmail, utiliser un mot de passe d'application
3. Vérifier que la validation en 2 étapes est activée (Gmail)

### Erreur "Connection refused"

**Cause** : Serveur SMTP inaccessible

**Solutions** :
1. Vérifier SMTP_HOST et SMTP_PORT
2. Vérifier la connexion internet du serveur
3. Vérifier le pare-feu (autoriser port 587)

### Email dans les spams

**Solutions** :
1. Demander à l'étudiant d'ajouter noreply@edupath.edu aux contacts
2. Configurer SPF/DKIM/DMARC pour le domaine d'envoi
3. Utiliser un service SMTP réputé (SendGrid, Mailgun)

## 🚀 Améliorations futures

### Fonctionnalités envisageables

1. **Templates personnalisables** :
   - Éditeur WYSIWYG pour les emails
   - Variables dynamiques (nom établissement, logo)
   - Multilingue (FR, EN, AR)

2. **Suivi des emails** :
   - Confirmation de réception
   - Notification d'ouverture
   - Tracking des clics sur le lien

3. **Rappels automatiques** :
   - Email de rappel si pas de connexion après 48h
   - Email de félicitations après première connexion
   - Email de rappel pour changer le mot de passe

4. **Options avancées** :
   - Planification d'envoi (envoyer à 8h le lendemain)
   - Envoi groupé avec délai (éviter le spam)
   - Pièce jointe PDF avec guide de démarrage

5. **Notifications SMS** :
   - Alternative à l'email
   - Pour les régions avec faible accès email
   - Via API Twilio/Vonage

## 📚 Exemples d'utilisation

### Exemple 1 : Rentrée universitaire

**Contexte** : 100 nouveaux étudiants à inscrire

**Processus** :
```
1. Prof créé un fichier Excel avec tous les emails
2. Importe dans EduPath (feature future)
3. Coche "Envoyer automatiquement"
4. Valide la création groupée
5. 100 emails envoyés automatiquement
6. Export PDF pour archives
```

### Exemple 2 : Inscription individuelle

**Contexte** : Étudiant arrive en retard

**Processus** :
```
1. Prof créé le compte
2. Coche "Envoyer automatiquement"
3. Étudiant reçoit l'email immédiatement
4. Peut se connecter pendant le cours
```

### Exemple 3 : Problème d'email

**Contexte** : Étudiant n'a pas reçu l'email

**Processus** :
```
1. Prof vérifie les logs
2. Voit que l'email a été envoyé
3. Étudiant vérifie ses spams
4. Si toujours pas reçu : renvoi manuel via "Copier"
```

## 📄 API Documentation

### Endpoint : POST /auth/admin/create-student

**Request Body** :
```json
{
  "email": "hassane.guedad@emsi-edu.ma",
  "first_name": "Hassane",
  "last_name": "Guedad",
  "student_id": 202312345,
  "send_email": true
}
```

**Response (Success)** :
```json
{
  "user": {
    "id": 42,
    "email": "hassane.guedad@emsi-edu.ma",
    "full_name": "Hassane Guedad",
    "role": "student",
    "is_active": true,
    "created_at": "2025-12-15T14:30:00Z"
  },
  "temporary_password": "AbC123xYz456",
  "email_sent": true
}
```

**Response (Email failed)** :
```json
{
  "user": { ... },
  "temporary_password": "AbC123xYz456",
  "email_sent": false
}
```

## 🔗 Ressources

### Documentation technique
- [aiosmtplib](https://aiosmtplib.readthedocs.io/) - Bibliothèque SMTP async
- [FastAPI Email](https://fastapi.tiangolo.com/) - Guide FastAPI
- [Gmail SMTP](https://support.google.com/mail/answer/7126229) - Configuration Gmail

### Services SMTP recommandés
- [SendGrid](https://sendgrid.com/) - 100 emails/jour gratuits
- [Mailgun](https://www.mailgun.com/) - 5000 emails/mois gratuits
- [Amazon SES](https://aws.amazon.com/ses/) - 62000 emails/mois gratuits

---

**Version** : 1.0  
**Date** : 15 décembre 2025  
**Auteur** : EduPath Development Team
