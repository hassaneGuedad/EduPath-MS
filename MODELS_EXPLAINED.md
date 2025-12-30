# Les Modèles d'IA dans EduPath-MS

Ce document détaille les algorithmes et modèles d'Intelligence Artificielle implémentés dans le projet.

## 1. Prédiction de Réussite (`Path Predictor`)

Ce service est chargé de prédire si un étudiant risque d'échouer ou non.

*   **Type d'apprentissage** : Apprentissage Supervisé (Supervised Learning).
*   **Algorithme** : **XGBoost (eXtreme Gradient Boosting)**.
*   **Pourquoi ce choix ?** : XGBoost est l'état de l'art pour les données tabulaires (structurées). Il est très performant, rapide et gère bien les valeurs manquantes.
*   **Données d'entrée (Features)** :
    *   Score moyen (`average_score`)
    *   Participation (`average_participation`)
    *   Temps passé (`total_time_spent`)
    *   Nombre de devoirs rendus (`total_assignments`)
    *   Tentatives de quiz (`total_quiz_attempts`)
    *   Score de risque historique (`risk_score`)
*   **Sortie (Target)** : Probabilité d'échec (entre 0 et 1).

## 2. Profilage des Étudiants (`Student Profiler`)

Ce service regroupe les étudiants en catégories pour mieux adapter la pédagogie.

*   **Type d'apprentissage** : Apprentissage Non-Supervisé (Clustering).
*   **Algorithmes** :
    1.  **StandardScaler** : Pour normaliser les données (mettre tout à la même échelle).
    2.  **PCA (Principal Component Analysis)** : Pour réduire la complexité des données (réduction de dimension).
    3.  **K-Means** : Pour créer des groupes (clusters).
*   **Les Profils Identifiés** :
    *   🟢 **High Performer** : Excellents résultats, autonome.
    *   🟡 **Average Learner** : Résultats moyens, besoin de soutien ponctuel.
    *   🔴 **At Risk** : En difficulté, nécessite une intervention immédiate.

## 3. Recommandation de Ressources (`Reco Builder`)

*   **Dans l'Architecture Cible** : Utilisation de **Transformers (BERT)** et **Faiss** pour faire de la recommandation sémantique avancée (Deep Learning).
*   **Dans l'Implémentation Actuelle (MVP)** : Utilisation d'un **Système Expert (Règles heuristiques)**.
    *   *Exemple de règle* : "Si l'étudiant a un score < 50, recommander des vidéos de niveau 'Débutant'".
    *   *Pourquoi ?* : Plus simple à mettre en œuvre pour une première version fonctionnelle sans avoir besoin d'une énorme base d'historique utilisateur.

---

## Résumé Technique

| Service | Librairie Python | Modèle | Type ML |
| :--- | :--- | :--- | :--- |
| **Path Predictor** | `xgboost` | `XGBClassifier` | Classification Supervisée |
| **Student Profiler** | `scikit-learn` | `KMeans`, `PCA` | Clustering (Non-supervisé) |
| **Reco Builder** | (Code Python natif) | Règles `if/else` | Système à règles (Pas de ML) |
