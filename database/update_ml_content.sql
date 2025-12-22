-- Mise à jour du contenu de la ressource ML--2025
UPDATE resources 
SET content = E'# 🤖 Introduction au Machine Learning

## 🎯 Objectifs du cours
Ce cours présente les bases du **Machine Learning** (apprentissage automatique) et ses applications pratiques.
À la fin de ce module, vous serez capable de comprendre les concepts fondamentaux du ML et d\'identifier les différents types d\'algorithmes.

---

## 📚 1. Qu\'est-ce que le Machine Learning ?

### 🔹 Définition
Le Machine Learning est une branche de l\'intelligence artificielle qui permet aux ordinateurs d\'apprendre à partir de données sans être explicitement programmés.

### 🔹 Types d\'apprentissage
- **Supervisé** : apprentissage à partir de données étiquetées
- **Non supervisé** : découverte de patterns dans des données non étiquetées
- **Par renforcement** : apprentissage par essai-erreur avec récompenses

---

## 🧠 2. Apprentissage Supervisé

### 🔹 Classification
Prédiction de catégories discrètes (ex: spam/non-spam, chat/chien).

**Algorithmes populaires:**
- K-Nearest Neighbors (KNN)
- Decision Trees (Arbres de décision)
- Random Forest
- Support Vector Machines (SVM)
- Réseaux de neurones

### 🔹 Régression
Prédiction de valeurs continues (ex: prix immobilier, température).

**Algorithmes populaires:**
- Régression linéaire
- Régression polynomiale
- Ridge & Lasso

---

## 🔍 3. Apprentissage Non Supervisé

### 🔹 Clustering (Regroupement)
Identifier des groupes naturels dans les données.

**Algorithmes:**
- K-Means
- DBSCAN
- Hierarchical Clustering

### 🔹 Réduction de dimensionnalité
Simplifier les données en conservant l\'information importante.

**Techniques:**
- PCA (Principal Component Analysis)
- t-SNE
- Autoencoders

---

## 📊 4. Préparation des données

### 🔹 Étapes essentielles
1. **Collecte** : rassembler les données
2. **Nettoyage** : gérer les valeurs manquantes
3. **Normalisation** : mettre à l\'échelle
4. **Séparation** : train/validation/test
5. **Feature engineering** : créer de nouvelles variables

### 🔹 Importance de la qualité des données
La qualité du modèle dépend directement de la qualité des données d\'entrée.

---

## 🎯 5. Évaluation des modèles

### 🔹 Métriques pour la classification
- **Accuracy** (Précision globale)
- **Precision** (Précision)
- **Recall** (Rappel)
- **F1-Score**
- **Matrice de confusion**

### 🔹 Métriques pour la régression
- **MAE** (Mean Absolute Error)
- **MSE** (Mean Squared Error)
- **RMSE** (Root Mean Squared Error)
- **R² Score**

---

## 🛠️ 6. Outils et bibliothèques

### 🔹 Python - L\'écosystème ML
- **NumPy** : calcul numérique
- **Pandas** : manipulation de données
- **Scikit-learn** : algorithmes ML
- **TensorFlow/PyTorch** : deep learning
- **Matplotlib/Seaborn** : visualisation

### 🔹 Exemple simple avec Scikit-learn
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Séparer les données
X_train, X_test, y_train, y_test = train_test_split(X, y)

# Créer et entraîner le modèle
model = LogisticRegression()
model.fit(X_train, y_train)

# Prédire
predictions = model.predict(X_test)
```

---

## 🚀 7. Applications pratiques

### 🔹 Exemples concrets
- **E-commerce** : systèmes de recommandation
- **Finance** : détection de fraude
- **Santé** : diagnostic médical
- **Marketing** : segmentation client
- **Transport** : véhicules autonomes
- **NLP** : traduction automatique, chatbots

---

## ⚠️ 8. Défis et considérations

### 🔹 Problèmes courants
- **Overfitting** : le modèle mémorise au lieu d\'apprendre
- **Underfitting** : le modèle est trop simple
- **Déséquilibre des classes** : données inégalement réparties
- **Biais dans les données** : représentation non équitable

### 🔹 Bonnes pratiques
- Validation croisée (cross-validation)
- Régularisation
- Augmentation des données
- Monitoring en production

---

## 📖 Conclusion

Le Machine Learning transforme de nombreux secteurs en permettant aux machines d\'apprendre et de s\'améliorer automatiquement. Cette introduction pose les bases pour approfondir vos connaissances dans ce domaine en constante évolution.

**Prochaines étapes :**
- Pratiquer avec des datasets réels (Kaggle, UCI)
- Explorer le Deep Learning
- Participer à des compétitions ML
- Suivre des cours avancés (Computer Vision, NLP)

🎓 **Continuez à apprendre et à expérimenter !**'
WHERE resource_id = 'ML--2025';
