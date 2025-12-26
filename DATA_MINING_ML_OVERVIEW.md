# Data Mining et Machine Learning dans EduPath-MS

## 1. Où la Data Mining est utilisée ?

La data mining (fouille de données) est principalement utilisée dans les microservices suivants :

- **PrepaData** :
  - Nettoyage, transformation et extraction de features à partir des données brutes (CSV).
  - Calcul de statistiques descriptives et préparation des données pour l'analyse.
- **StudentProfiler** :
  - Application de techniques de clustering (KMeans) et de réduction de dimensionnalité (PCA) pour profiler les étudiants selon leurs comportements et résultats.
- **PathPredictor** :
  - Analyse des patterns d'apprentissage pour identifier les facteurs de risque d'échec.
- **RecoBuilder** :
  - Analyse des historiques d'apprentissage pour extraire des patterns de recommandations.

## 2. Où le Machine Learning (ML/DL) est utilisé ?

Le Machine Learning (et Deep Learning) intervient dans :

- **StudentProfiler** :
  - Utilise des algorithmes de clustering (KMeans) pour regrouper les étudiants selon leurs profils.
  - Utilise PCA pour la réduction de dimensionnalité.
- **PathPredictor** :
  - Utilise XGBoost (modèle d'ensemble supervisé) pour prédire le risque d'échec d'un étudiant sur un module donné.
- **RecoBuilder** :
  - Utilise des modèles de type Transformers (Deep Learning) pour générer des recommandations personnalisées.
  - Utilise Faiss pour la recherche de similarité rapide dans de grands ensembles de vecteurs (recherche de ressources similaires).

## 3. Détail par microservice

### PrepaData (Python + Flask)
- **Data Mining** : Nettoyage, feature engineering, statistiques descriptives.
- **ML** : Préparation des données pour les modèles en aval.

### StudentProfiler (Python + scikit-learn)
- **ML** : KMeans (clustering non supervisé), PCA (réduction de dimension).
- **Objectif** : Segmenter les étudiants selon leurs comportements d'apprentissage.

### PathPredictor (Python + XGBoost)
- **ML** : XGBoost (classification supervisée).
- **Objectif** : Prédire le risque d'échec d'un étudiant sur un module.

### RecoBuilder (Python + Transformers + Faiss)
- **ML/DL** :
  - Transformers (Deep Learning) pour l'encodage sémantique des ressources et la génération de recommandations.
  - Faiss pour la recherche de similarité (matching rapide de vecteurs).
- **Objectif** : Générer des recommandations personnalisées de ressources pédagogiques.

## 4. Flux de données typique

1. **LMSConnector** importe les données brutes (CSV).
2. **PrepaData** nettoie et prépare les données (data mining).
3. **StudentProfiler** segmente les étudiants (ML non supervisé).
4. **PathPredictor** prédit le risque d'échec (ML supervisé).
5. **RecoBuilder** génère des recommandations (ML/DL).

## 5. Technologies utilisées
- **scikit-learn** : KMeans, PCA
- **XGBoost** : Classification
- **Transformers** : Deep Learning (NLP)
- **Faiss** : Recherche de similarité

## 6. Références dans le code
- Voir les dossiers :
  - `services/prepa-data/`
  - `services/student-profiler/`
  - `services/path-predictor/`
  - `services/reco-builder/`

Chaque dossier contient le code source et un README détaillant les algorithmes utilisés.
