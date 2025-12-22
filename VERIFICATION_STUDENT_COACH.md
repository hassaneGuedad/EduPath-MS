# Vérification de Conformité : StudentCoach

## 📋 Spécifications Académiques

**Rôle :** Interface mobile étudiante (feedback + coaching + suggestions)  
**Technologies :** Flutter + FastAPI  
**Base de données :** PostgreSQL  
**Description :** Permet aux apprenants de consulter leur progression, recevoir des messages motivants, des conseils personnalisés, et accéder aux ressources conseillées par RecoBuilder.

---

## ✅ Points Conformes

### 1. Architecture Technique ✅
- **FastAPI** : Implémenté dans `services/student-coach-api/src/main.py`
- **Flutter** : Application mobile dans `services/student-coach-flutter/`
- **Structure microservice** : API et application mobile séparées

### 2. Fonctionnalités Implémentées ✅

#### API FastAPI (student-coach-api)
- ✅ **GET /student/{student_id}/progress** : Consultation de la progression
  - Score moyen
  - Nombre de modules
  - Niveau d'engagement
  - Tendance de performance
  - Temps total passé
  - Profil ML de l'étudiant

- ✅ **GET /student/{student_id}/recommendations** : Recommandations personnalisées
  - Intégration avec RecoBuilder
  - Paramètre `top_k` pour limiter le nombre de recommandations

- ✅ **POST /student/{student_id}/predict** : Prédiction du risque d'échec
  - Intégration avec PathPredictor

- ✅ **GET /student/{student_id}/dashboard** : Dashboard complet
  - Agrège progression + profil + prédiction + recommandations

#### Application Flutter (student-coach-flutter)
- ✅ **Carte de progression** : Affichage des statistiques de l'étudiant
- ✅ **Carte de profil ML** : Affichage du profil d'apprentissage
- ✅ **Carte de prédiction** : Affichage du risque d'échec avec code couleur
- ✅ **Carte de recommandations** : Liste des ressources conseillées par RecoBuilder
- ✅ **Interface Material Design** : UI moderne et responsive

### 3. Intégrations Microservices ✅
- ✅ PrepaData (port 3002) : Récupération des features
- ✅ StudentProfiler (port 3003) : Récupération du profil ML
- ✅ PathPredictor (port 3004) : Prédiction du risque
- ✅ RecoBuilder (port 3005) : Recommandations personnalisées

---

## ⚠️ Points Non Conformes / Manquants

### 1. Base de Données PostgreSQL ❌ **CRITIQUE**

**Problème** : L'API StudentCoach ne se connecte PAS directement à PostgreSQL.

**Comportement actuel** :
- L'API agit comme un **agrégateur** (API Gateway)
- Elle consomme les données des autres microservices via HTTP
- Aucune connexion PostgreSQL dans le code
- Pas de `psycopg2` ou `asyncpg` dans `requirements.txt`

**Impact** :
- Non-conformité avec la spécification "Base de données : PostgreSQL"
- Dépendance totale aux autres microservices pour les données

**Recommandation** :
- Ajouter une connexion PostgreSQL directe pour les données spécifiques au coaching (historique des messages, préférences utilisateur, etc.)
- Installer `psycopg2-binary` ou `asyncpg`
- Créer des tables dédiées : `student_messages`, `coaching_sessions`, `student_preferences`

### 2. Messages Motivants ❌ **MANQUANT**

**Problème** : Aucun système de messages motivants implémenté.

**Spécification** : "recevoir des messages motivants"

**Ce qui manque** :
- Endpoint `/student/{student_id}/motivational-messages`
- Logique de génération de messages basée sur :
  - Le score de l'étudiant
  - La tendance de performance
  - Le niveau d'engagement
  - Les accomplissements récents
- Messages personnalisés selon le profil ML :
  - "High Performer" : "🏆 Excellent travail ! Continue comme ça !"
  - "Average Learner" : "💪 Tu fais des progrès, persévère !"
  - "At Risk" : "🌟 N'abandonne pas, chaque effort compte !"

**Impact** : Fonctionnalité clé manquante pour le coaching motivationnel.

### 3. Conseils Personnalisés (Coaching) ⚠️ **PARTIEL**

**Problème** : Les recommandations existent mais ne sont pas présentées comme des "conseils de coaching".

**Ce qui existe** :
- ✅ Recommandations de ressources (via RecoBuilder)
- ✅ Affichage des ressources conseillées

**Ce qui manque** :
- ❌ Conseils pédagogiques personnalisés :
  - "Concentre-toi sur les concepts fondamentaux"
  - "Pratique plus d'exercices en algèbre"
  - "Révise les chapitres 2 et 3"
- ❌ Suggestions d'actions concrètes :
  - "Planifie 30 minutes de révision par jour"
  - "Rejoins un groupe d'étude"
  - "Consulte le tuteur pour l'aide"
- ❌ Suivi des objectifs personnels

**Recommandation** : Ajouter un endpoint `/student/{student_id}/coaching-advice` avec des conseils contextuels.

### 4. Feedback Interactif ❌ **MANQUANT**

**Problème** : Pas de système de feedback bidirectionnel.

**Ce qui manque** :
- ❌ Permettre à l'étudiant de noter les recommandations
- ❌ Capturer les retours sur les conseils reçus
- ❌ Historique des interactions de coaching
- ❌ Système de questions/réponses avec le coach virtuel

**Impact** : L'application est unidirectionnelle (affichage uniquement), pas de boucle de feedback.

---

## 📊 Taux de Conformité

### Conformité Globale : **60%**

| Critère | Status | Score |
|---------|--------|-------|
| Technologies (Flutter + FastAPI) | ✅ Complet | 100% |
| Base de données PostgreSQL | ❌ Manquant | 0% |
| Consultation progression | ✅ Complet | 100% |
| Messages motivants | ❌ Manquant | 0% |
| Conseils personnalisés | ⚠️ Partiel | 50% |
| Ressources RecoBuilder | ✅ Complet | 100% |
| Feedback interactif | ❌ Manquant | 0% |

---

## 🔧 Plan d'Action pour Conformité 100%

### Priorité 1 : Messages Motivants (2h)
1. Créer une fonction `generate_motivational_message()` dans l'API
2. Ajouter endpoint `GET /student/{student_id}/motivational-message`
3. Implémenter logique basée sur :
   - Score (< 50: encouragement, 50-75: motivation, > 75: félicitations)
   - Tendance (amélioration vs déclin)
   - Profil ML
4. Ajouter carte "Message du Jour" dans l'app Flutter

### Priorité 2 : Connexion PostgreSQL (3h)
1. Ajouter `psycopg2-binary` ou `asyncpg` dans requirements.txt
2. Créer schéma de base de données :
   ```sql
   CREATE TABLE student_coaching_sessions (
     id SERIAL PRIMARY KEY,
     student_id INTEGER NOT NULL,
     session_date TIMESTAMP DEFAULT NOW(),
     message_sent TEXT,
     advice_given TEXT,
     student_feedback TEXT,
     rating INTEGER
   );
   
   CREATE TABLE motivational_messages (
     id SERIAL PRIMARY KEY,
     profile_type VARCHAR(50),
     score_range VARCHAR(20),
     message TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
3. Implémenter connexion DB dans l'API
4. Stocker historique des interactions

### Priorité 3 : Conseils de Coaching (4h)
1. Créer endpoint `GET /student/{student_id}/coaching-advice`
2. Implémenter logique de génération de conseils :
   - Analyser les faiblesses (modules avec scores bas)
   - Identifier les patterns de comportement
   - Générer conseils actionnables
3. Afficher conseils dans une section dédiée de l'app

### Priorité 4 : Feedback Interactif (3h)
1. Ajouter endpoints :
   - `POST /student/{student_id}/feedback` : Soumettre feedback
   - `POST /student/{student_id}/rate-recommendation` : Noter une recommandation
2. Créer formulaire de feedback dans l'app Flutter
3. Stocker feedback dans PostgreSQL pour amélioration continue

---

## 📦 Fichiers Modifiés/Créés

### À Modifier
- `services/student-coach-api/requirements.txt` : Ajouter psycopg2-binary
- `services/student-coach-api/src/main.py` : Ajouter connexion DB et nouveaux endpoints
- `services/student-coach-flutter/lib/screens/dashboard_screen.dart` : Ajouter carte messages motivants

### À Créer
- `services/student-coach-api/src/database.py` : Connexion PostgreSQL
- `services/student-coach-api/src/coaching_engine.py` : Logique de génération de conseils
- `services/student-coach-flutter/lib/screens/feedback_screen.dart` : Écran de feedback
- `database/init_coaching.sql` : Script d'initialisation des tables

---

## 🎯 Conclusion

Le microservice **StudentCoach** est **fonctionnel** mais **incomplet** par rapport aux spécifications académiques.

**Points forts** :
- ✅ Architecture microservices respectée (Flutter + FastAPI)
- ✅ Intégrations avec les autres services (PrepaData, StudentProfiler, PathPredictor, RecoBuilder)
- ✅ Interface mobile fonctionnelle et claire
- ✅ Affichage complet de la progression et des recommandations

**Points critiques à corriger** :
- ❌ **Base de données PostgreSQL manquante** (spécification technique non respectée)
- ❌ **Messages motivants absents** (fonctionnalité clé du coaching)
- ⚠️ **Conseils personnalisés limités** (uniquement via recommandations de ressources)
- ❌ **Feedback interactif manquant** (coaching unidirectionnel)

**Estimation de travail** : 12-15 heures pour atteindre 100% de conformité.

---

**Date de vérification** : 21 décembre 2025  
**Vérificateur** : GitHub Copilot  
**Statut** : ⚠️ CONFORMITÉ PARTIELLE - ACTIONS REQUISES
