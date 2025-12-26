# Machine Learning, Deep Learning & Data Mining dans EduPath

Ce document explique en détail où et comment les technologies de Machine Learning (ML), Deep Learning (DL) et Data Mining sont utilisées dans le projet EduPath.

---

## 📊 Vue d'ensemble

EduPath est une plateforme d'apprentissage adaptatif qui utilise plusieurs techniques d'IA pour :
- **Prédire** les risques d'échec des étudiants
- **Profiler** les étudiants selon leurs comportements d'apprentissage
- **Recommander** des ressources pédagogiques personnalisées
- **Analyser** les données d'apprentissage pour optimiser les parcours

---

## 🎯 Architecture ML/DL

```
┌─────────────────┐
│   LMS Connector │ ──► Extraction des données brutes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Prepa-Data    │ ──► Data Mining & Feature Engineering
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│ Student Profiler │              │ Path Predictor   │
│   (Clustering)   │              │   (XGBoost)      │
└────────┬─────────┘              └────────┬─────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │  Reco Builder    │
                │ (Rule-Based ML)  │
                └──────────────────┘
```

---

## 1️⃣ Data Mining - PrepaData Service

### 📍 Localisation
**Service**: `services/prepa-data/`

### 🔍 Techniques utilisées

#### A. Extraction de données (ETL)
```python
# Extraction depuis le LMS
GET /lms-connector/students
GET /lms-connector/modules
GET /lms-connector/interactions
```

#### B. Feature Engineering
Le service transforme les données brutes en features exploitables :

**Features calculées** :
- `average_score` : Score moyen de l'étudiant
- `average_participation` : Taux de participation (0-1)
- `total_time_spent` : Temps total passé (heures)
- `total_assignments` : Nombre de devoirs soumis
- `total_quiz_attempts` : Nombre de tentatives de quiz
- `risk_score` : Score de risque calculé (0-100)

**Formule du Risk Score** :
```python
risk_score = (
    (100 - average_score) * 0.4 +
    (1 - average_participation) * 100 * 0.3 +
    (max_time - total_time_spent) / max_time * 100 * 0.3
)
```

#### C. Agrégation et statistiques
- Calcul de moyennes par étudiant/module
- Détection d'anomalies dans les patterns d'apprentissage
- Création de datasets pour l'entraînement ML

### 📊 Données stockées
- **Base de données** : PostgreSQL (`edupath_prepa`)
- **Format** : Tables normalisées avec index pour performance
- **Volume** : Données de tous les étudiants et interactions

---

## 2️⃣ Machine Learning - Path Predictor

### 📍 Localisation
**Service**: `services/path-predictor/`

### 🤖 Algorithme : XGBoost Classifier

#### Pourquoi XGBoost ?
- ✅ Excellent pour la classification binaire
- ✅ Gère bien les données tabulaires
- ✅ Résistant à l'overfitting
- ✅ Rapide en prédiction
- ✅ Interprétable (feature importance)

### 🎓 Entraînement du modèle

#### A. Préparation des données
```python
# Features d'entrée (X)
feature_cols = [
    'average_score',           # Score moyen
    'average_participation',   # Participation
    'total_time_spent',        # Temps d'étude
    'total_assignments',       # Devoirs
    'total_quiz_attempts',     # Quiz
    'risk_score'              # Score de risque
]

# Label (y)
will_fail = 1 if failure_prob > 0.5 else 0
```

#### B. Hyperparamètres
```python
XGBClassifier(
    n_estimators=100,      # 100 arbres
    max_depth=5,           # Profondeur max
    learning_rate=0.1,     # Taux d'apprentissage
    random_state=42        # Reproductibilité
)
```

#### C. Métriques de performance
- **Accuracy** : Précision globale du modèle
- **Precision/Recall** : Pour détecter les étudiants à risque
- **Feature Importance** : Quelles features influencent le plus

### 🔮 Prédiction

**Input** :
```json
{
  "student_id": 12345
}
```

**Output** :
```json
{
  "will_fail": false,
  "failure_probability": 0.23,
  "success_probability": 0.77,
  "risk_level": "Low"
}
```

**Niveaux de risque** :
- `High` : probability ≥ 0.7
- `Medium` : 0.4 ≤ probability < 0.7
- `Low` : probability < 0.4

### 📈 MLflow Integration
Tous les entraînements sont trackés avec MLflow :
- **Métriques** : accuracy, n_samples
- **Paramètres** : max_depth, learning_rate
- **Modèles** : Sauvegarde automatique
- **Run ID** : Traçabilité complète

---

## 3️⃣ Machine Learning - Student Profiler

### 📍 Localisation
**Service**: `services/student-profiler/`

### 🤖 Algorithmes utilisés

#### A. K-Means Clustering
**Objectif** : Regrouper les étudiants en profils similaires

```python
KMeans(
    n_clusters=3,      # 3 profils
    random_state=42,
    n_init=10
)
```

**Les 3 profils** :
1. **High Performer** : Score élevé, risque faible
2. **Average Learner** : Performance moyenne
3. **At Risk** : Score faible, risque élevé

#### B. PCA (Principal Component Analysis)
**Objectif** : Réduction de dimensionnalité

```python
PCA(n_components=3)  # 6 features → 3 composantes
```

**Avantages** :
- Réduit le bruit dans les données
- Améliore la vitesse du clustering
- Visualisation possible en 3D

#### C. StandardScaler
**Objectif** : Normalisation des features

```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**Pourquoi ?** Les features ont des échelles différentes (score 0-100, participation 0-1)

### 🎯 Classification des profils

**Algorithme de mapping** :
```python
# Calcul d'un indicateur de performance
performance_indicator = average_score - (risk_score * 0.5)

# Tri des clusters par performance
cluster_mapping = {
    best_cluster: 0,    # High Performer
    mid_cluster: 1,     # Average Learner
    worst_cluster: 2    # At Risk
}
```

### 📊 Output
```json
{
  "cluster": 0,
  "profile_name": "High Performer"
}
```

---

## 4️⃣ Système de Recommandation - Reco Builder

### 📍 Localisation
**Service**: `services/reco-builder/`

### 🤖 Approche : Rule-Based ML

#### A. Analyse des difficultés
```python
def get_student_difficulties(student_id):
    difficulties = []
    
    if average_score < 60:
        difficulties.append('low_performance')
    if average_participation < 0.7:
        difficulties.append('low_engagement')
    if risk_score > 50:
        difficulties.append('high_risk')
    if total_time_spent < 30:
        difficulties.append('low_study_time')
```

#### B. Scoring des ressources
**Algorithme de pertinence** :
```python
def score_resource(resource, difficulties):
    score = 0.0
    
    # Règle 1: Performance faible → Ressources Beginner
    if 'low_performance' in difficulties:
        if difficulty_level == 'beginner':
            score += 3
    
    # Règle 2: Engagement faible → Vidéos/Exercices
    if 'low_engagement' in difficulties:
        if resource_type in ['video', 'exercise']:
            score += 3
    
    # Règle 3: Risque élevé → Ressources de révision
    if 'high_risk' in difficulties:
        if 'revision' in tags:
            score += 2
    
    return score
```

#### C. Ranking et sélection
```python
# Tri par score décroissant
scored.sort(key=lambda r: r['relevance_score'], reverse=True)

# Top-K recommandations
recommendations = scored[:top_k]
```

### 📚 Données de ressources
**Source** : `data/resources.csv`

**Colonnes** :
- `resource_id` : Identifiant unique
- `resource_name` : Nom de la ressource
- `resource_type` : Type (video, article, exercise, etc.)
- `module_id` : Module associé
- `difficulty_level` : Niveau (beginner, intermediate, advanced)
- `tags` : Tags séparés par virgules
- `description` : Description

---

## 5️⃣ Orchestration - Apache Airflow

### 📍 Localisation
**Service**: `services/airflow/`

### 🔄 DAGs (Directed Acyclic Graphs)

#### Pipeline de données quotidien
```python
# Exemple de DAG
extract_data >> transform_data >> train_models >> update_predictions
```

**Tâches automatisées** :
1. **Extraction** : Récupération des nouvelles données LMS
2. **Transformation** : Feature engineering
3. **Entraînement** : Re-entraînement des modèles ML
4. **Prédiction** : Mise à jour des prédictions
5. **Alertes** : Notification des étudiants à risque

### ⏰ Scheduling
- **Fréquence** : Quotidienne (configurable)
- **Retry** : 3 tentatives en cas d'échec
- **Monitoring** : Interface web Airflow (port 8081)

---

## 6️⃣ Tracking & Versioning - MLflow

### 📍 Localisation
**Service**: `services/mlflow/`

### 📊 Fonctionnalités

#### A. Experiment Tracking
```python
with mlflow.start_run():
    # Entraînement
    model.fit(X, y)
    
    # Log des métriques
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1)
    
    # Log des paramètres
    mlflow.log_param("max_depth", 5)
    mlflow.log_param("learning_rate", 0.1)
    
    # Sauvegarde du modèle
    mlflow.xgboost.log_model(model, "model")
```

#### B. Model Registry
- **Versioning** : Tous les modèles sont versionnés
- **Staging** : Modèles en test vs production
- **Rollback** : Retour à une version précédente possible

#### C. Artifacts Storage
- **Modèles** : Fichiers .pkl, .json
- **Métriques** : Historique complet
- **Visualisations** : Courbes, matrices de confusion

### 🌐 Interface Web
**URL** : `http://localhost:5000`

---

## 7️⃣ Benchmarking - Performance Monitoring

### 📍 Localisation
**Service**: `services/benchmarks-service/`

### 📈 Métriques suivies

#### A. Métriques ML
- **Accuracy** : Précision des prédictions
- **Latency** : Temps de réponse des modèles
- **Throughput** : Nombre de prédictions/seconde

#### B. Métriques Data
- **Data Quality** : Taux de données manquantes
- **Feature Distribution** : Détection de drift
- **Pipeline Health** : Statut des ETL

#### C. Métriques Business
- **Student Engagement** : Taux d'utilisation
- **Recommendation CTR** : Taux de clic sur recommandations
- **Risk Alert Accuracy** : Précision des alertes

---

## 🔧 Technologies utilisées

### Machine Learning
| Technologie | Usage | Service |
|------------|-------|---------|
| **XGBoost** | Classification (prédiction d'échec) | path-predictor |
| **Scikit-learn** | Clustering, PCA, preprocessing | student-profiler |
| **Pandas** | Manipulation de données | Tous |
| **NumPy** | Calculs numériques | Tous |

### Deep Learning
| Technologie | Usage potentiel | Statut |
|------------|-----------------|--------|
| **Transformers** | NLP pour analyse de textes | Prévu (reco-builder) |
| **FAISS** | Recherche vectorielle | Prévu (reco-builder) |

### Data Engineering
| Technologie | Usage | Service |
|------------|-------|---------|
| **Apache Airflow** | Orchestration ETL | airflow |
| **PostgreSQL** | Stockage données | Tous |
| **MLflow** | ML Ops | mlflow |

---

## 📊 Flux de données complet

```
1. EXTRACTION (LMS Connector)
   ↓
2. DATA MINING (Prepa-Data)
   - Feature Engineering
   - Agrégation
   - Calcul du risk_score
   ↓
3. MACHINE LEARNING
   ├─→ Path Predictor (XGBoost)
   │   - Prédiction d'échec
   │   - Calcul de probabilités
   │
   └─→ Student Profiler (K-Means + PCA)
       - Clustering en 3 profils
       - Classification des étudiants
   ↓
4. RECOMMANDATION (Reco Builder)
   - Analyse des difficultés
   - Scoring des ressources
   - Top-K recommandations
   ↓
5. DELIVERY (APIs)
   - Student Coach API
   - Teacher Console
   - Student Portal
```

---

## 🎓 Cas d'usage concrets

### Exemple 1 : Détection précoce d'échec
```
Étudiant → Features → XGBoost → Probabilité 0.75 → Alerte "High Risk"
```

### Exemple 2 : Recommandation personnalisée
```
Étudiant → Profil "At Risk" → Ressources Beginner + Vidéos → Top 5
```

### Exemple 3 : Suivi de progression
```
Étudiant → Clustering → "Average Learner" → Tableau de bord adapté
```

---

## 🚀 Améliorations futures

### Court terme
- [ ] Ajout de features temporelles (tendances)
- [ ] Modèles par module (spécialisation)
- [ ] A/B testing des recommandations

### Moyen terme
- [ ] Deep Learning pour NLP (analyse de feedbacks)
- [ ] Reinforcement Learning (optimisation de parcours)
- [ ] Explainability (SHAP values)

### Long terme
- [ ] Modèles multi-modaux (texte + comportement)
- [ ] Transfer Learning entre établissements
- [ ] AutoML pour optimisation automatique

---

## 📚 Références

### Documentation
- **XGBoost** : https://xgboost.readthedocs.io/
- **Scikit-learn** : https://scikit-learn.org/
- **MLflow** : https://mlflow.org/
- **Airflow** : https://airflow.apache.org/

### Papers
- Chen & Guestrin (2016) - XGBoost: A Scalable Tree Boosting System
- MacQueen (1967) - K-Means Clustering
- Pearson (1901) - Principal Component Analysis

---

## 👥 Contact & Support

Pour toute question sur l'implémentation ML/DL :
- **Documentation technique** : Voir `/docs` dans chaque service
- **Logs MLflow** : http://localhost:5000
- **Monitoring Airflow** : http://localhost:8081

---

**Version** : 1.0  
**Dernière mise à jour** : Décembre 2025  
**Projet** : EduPath - Plateforme d'apprentissage adaptatif
