# 🎨 Maquettes UI/UX - EduPath-MS

## Instructions pour Créer les Maquettes Figma

Ce document décrit les maquettes à créer dans Figma pour les interfaces utilisateur d'EduPath-MS.

---

## 📱 1. TeacherConsole (Dashboard Enseignant)

### 1.1 Page de Connexion

**Fichier Figma** : `TeacherConsole_Login.fig`

**Éléments à inclure** :
- Logo EduPath (en haut, centré)
- Titre : "Espace Enseignant"
- Formulaire :
  - Champ Email (avec icône mail)
  - Champ Password (avec icône cadenas, masqué)
  - Bouton "Se connecter" (bleu, largeur pleine)
  - Lien "Mot de passe oublié ?" (sous le bouton)
- Footer : "© 2024 EduPath-MS - Learning Analytics"

**Couleurs suggérées** :
- Fond : #F5F7FA
- Bouton principal : #4A90E2
- Texte : #2C3E50
- Bordure champs : #E1E8ED

**Dimensions** : Desktop (1920x1080)

---

### 1.2 Dashboard Principal

**Fichier Figma** : `TeacherConsole_Dashboard.fig`

**Layout** :
- **Header** :
  - Logo EduPath (gauche)
  - Menu navigation (Dashboard, Étudiants, Modules, Ressources, Paramètres)
  - Avatar utilisateur + dropdown (droite)
  
- **Sidebar** (gauche, fixe) :
  - Navigation verticale
  - Icônes + labels
  
- **Contenu principal** :
  - **Section 1 : Vue d'ensemble** (3 cards côte à côte)
    - Card 1 : "Total Étudiants" (nombre + icône)
    - Card 2 : "Étudiants à Risque" (nombre + badge rouge)
    - Card 3 : "Taux de Réussite" (pourcentage + graphique mini)
  
  - **Section 2 : Graphiques** (2 colonnes)
    - Graphique 1 : "Répartition par Profil" (Chart.js Pie)
      - Légende : Assidu, Procrastinateur, En difficulté, Irrégulier
    - Graphique 2 : "Évolution des Scores" (Chart.js Line)
      - Axe X : Mois
      - Axe Y : Score moyen
  
  - **Section 3 : Alertes** (liste)
    - Tableau : Étudiants à risque élevé
    - Colonnes : Nom, Module, Risque, Action
    - Badges de couleur selon niveau de risque
  
  - **Section 4 : Statistiques Modules** (tableau)
    - Colonnes : Module, Taux réussite, Étudiants en difficulté, Action

**Composants réutilisables** :
- Card (statistique)
- Graphique (wrapper)
- Table (avec pagination)
- Badge (risque)
- Button (action)

---

### 1.3 Page Détail Étudiant

**Fichier Figma** : `TeacherConsole_StudentDetail.fig`

**Layout** :
- **Header** :
  - Bouton retour
  - Nom étudiant (titre)
  - Badge profil (Assidu/Procrastinateur/etc.)
  
- **Section 1 : Informations générales**
  - Photo/Avatar
  - Email, ID étudiant
  - Profil d'apprentissage détecté
  - Caractéristiques (engagement, régularité, etc.)
  
- **Section 2 : Historique des Scores**
  - Graphique : Évolution des scores par module (Chart.js Line)
  - Tableau : Détails des scores
  
- **Section 3 : Prédictions de Risque**
  - Cards par module avec :
    - Nom module
    - Score de risque (0-100%)
    - Barre de progression colorée
    - Confidence du modèle
  
- **Section 4 : Recommandations Envoyées**
  - Liste des recommandations avec statut (envoyé, lu, ignoré)
  
- **Section 5 : Actions**
  - Bouton "Envoyer message"
  - Bouton "Planifier tutorat"
  - Bouton "Générer rapport"

---

### 1.4 Page Clustering

**Fichier Figma** : `TeacherConsole_Clustering.fig`

**Layout** :
- **Visualisation principale** :
  - Graphique Scatter (Chart.js)
  - Axes : Dimension 1 vs Dimension 2 (PCA)
  - Points colorés par cluster
  - Légende des clusters
  
- **Filtres** :
  - Sélection par profil
  - Sélection par module
  - Recherche étudiant
  
- **Liste étudiants** :
  - Tableau avec colonnes : Nom, Profil, Cluster, Actions
  - Filtrage par cluster

---

## 📱 2. StudentPortal (Portail Étudiant)

### 2.1 Page de Connexion

**Fichier Figma** : `StudentPortal_Login.fig`

**Éléments** :
- Logo EduPath (plus coloré, étudiant-friendly)
- Titre : "Bienvenue sur EduPath"
- Sous-titre : "Accompagnement personnalisé pour votre réussite"
- Formulaire :
  - Champ Email
  - Champ Password
  - Bouton "Se connecter"
  - Lien "Créer un compte" (sous le bouton)
- Illustration (optionnel) : Étudiant avec ordinateur

**Couleurs suggérées** :
- Fond : #FFFFFF
- Bouton principal : #52C41A (vert)
- Accent : #1890FF (bleu)

---

### 2.2 Dashboard Étudiant

**Fichier Figma** : `StudentPortal_Dashboard.fig`

**Layout** :
- **Header** :
  - Logo EduPath
  - Navigation : Dashboard, Recommandations, Progression, Profil
  - Avatar + dropdown
  
- **Section 1 : Progression Globale**
  - Card circulaire : Score moyen global (CircularProgressIndicator)
  - Graphique : Évolution des scores (Chart.js Line)
  - Graphique : Temps passé par module (Chart.js Bar)
  
- **Section 2 : Recommandations du Jour**
  - Titre : "Recommandations pour vous"
  - Cards horizontales scrollables :
    - Image preview (ou icône)
    - Titre ressource
    - Type (vidéo, exercice, doc)
    - Badge "Nouveau" si applicable
    - Bouton "Voir"
  
- **Section 3 : Alertes et Conseils**
  - Cards avec icônes :
    - Alerte : "Attention au module Mathématiques"
    - Conseil : "Continuez vos efforts en Programmation"
    - Motivation : "Vous progressez bien !"
  
- **Section 4 : Modules Actifs**
  - Liste des modules avec :
    - Nom module
    - Score actuel
    - Progression (barre)
    - Statut (En cours, Terminé, À risque)

---

### 2.3 Page Recommandations

**Fichier Figma** : `StudentPortal_Recommendations.fig`

**Layout** :
- **Filtres** (en haut) :
  - Type : Tous, Vidéo, Exercice, Documentation
  - Recherche par mot-clé
  - Trier par : Pertinence, Date, Type
  
- **Grille de recommandations** :
  - Cards (3 colonnes sur desktop, 2 sur tablette, 1 sur mobile)
  - Chaque card contient :
    - Image/Preview
    - Titre
    - Description (tronquée)
    - Type (badge)
    - Score de pertinence
    - Actions : "Voir", "Marquer comme lu", "Feedback"
  
- **Pagination** (en bas)

---

### 2.4 Page Progression

**Fichier Figma** : `StudentPortal_Progression.fig`

**Layout** :
- **Graphique principal** :
  - Évolution des scores par module (Chart.js Multi-Line)
  - Légende interactive
  
- **Détails par module** (accordéon ou tabs) :
  - Pour chaque module :
    - Score actuel
    - Temps passé
    - Nombre de sessions
    - Objectifs personnels
    - Graphique de progression
  
- **Statistiques personnelles** :
  - Card : "Temps total passé"
  - Card : "Modules complétés"
  - Card : "Score moyen global"

---

## 📱 3. StudentCoach (Application Mobile Flutter)

### 3.1 Écran de Connexion

**Fichier Figma** : `StudentCoach_Login.fig`

**Éléments** :
- Logo EduPath (centré, haut)
- Titre : "EduPath"
- Sous-titre : "Votre coach d'apprentissage"
- Formulaire :
  - Champ Email (Material Design)
  - Champ Password (Material Design)
  - Bouton "Se connecter" (Material, largeur pleine)
  - Lien "Créer un compte"
- Illustration (optionnel) : Mobile avec app

**Dimensions** : Mobile (375x812 - iPhone X)

---

### 3.2 Écran Accueil

**Fichier Figma** : `StudentCoach_Home.fig`

**Layout** :
- **AppBar** :
  - Titre : "Bonjour [Prénom]"
  - Icône notifications (droite)
  
- **Widget Progression Globale** :
  - CircularProgressIndicator (grand, centré)
  - Score moyen affiché au centre
  - Texte : "Votre progression"
  
- **Section Recommandations** :
  - Titre : "Pour vous aujourd'hui"
  - ListView horizontale scrollable :
    - Cards avec image, titre, type
    - Swipe actions : "Marquer comme lu"
  
- **Section Alertes** :
  - Cards avec icônes
  - Tap pour voir détails
  
- **BottomNavigationBar** :
  - Accueil (actif)
  - Recommandations
  - Progression
  - Profil

---

### 3.3 Écran Recommandations

**Fichier Figma** : `StudentCoach_Recommendations.fig`

**Layout** :
- **AppBar** :
  - Titre : "Recommandations"
  - Icône filtre (droite)
  
- **Filtres** (sous AppBar) :
  - Chips : Tous, Vidéos, Exercices, Docs
  
- **ListView** :
  - Cards avec :
    - Image/Preview (gauche)
    - Titre + Description (centre)
    - Icône type (droite)
    - Badge "Nouveau" si applicable
  - Swipe actions :
    - Swipe gauche : "Marquer comme lu"
    - Swipe droite : "Feedback"
  
- **FloatingActionButton** (optionnel) : Actualiser

---

### 3.4 Écran Détail Recommandation

**Fichier Figma** : `StudentCoach_RecommendationDetail.fig`

**Layout** :
- **AppBar** :
  - Bouton retour
  - Titre : Nom ressource
  - Icône partage (droite)
  
- **Image/Preview** (pleine largeur)
  
- **Contenu** :
  - Titre (grand)
  - Type (badge)
  - Description (texte)
  - Score de pertinence
  
- **Player/Viewer** :
  - Si vidéo : Player vidéo
  - Si PDF : PDF Viewer
  - Si exercice : Lien vers exercice
  
- **Actions** (boutons en bas) :
  - "Marquer comme lu"
  - "Utile" / "Pas utile" (feedback)
  - "Partager"

---

## 🎨 Guide de Style Global

### Palette de Couleurs

**Primaire** :
- Bleu : `#4A90E2` (TeacherConsole)
- Vert : `#52C41A` (StudentPortal)
- Violet : `#722ED1` (StudentCoach)

**Secondaire** :
- Gris clair : `#F5F7FA`
- Gris moyen : `#E1E8ED`
- Gris foncé : `#2C3E50`

**Alertes** :
- Succès : `#52C41A`
- Avertissement : `#FAAD14`
- Erreur : `#F5222D`
- Info : `#1890FF`

### Typographie

**Fonts** :
- Headings : Inter, Roboto, ou System Font
- Body : Inter, Roboto, ou System Font
- Code : 'Courier New', monospace

**Tailles** :
- H1 : 32px
- H2 : 24px
- H3 : 20px
- Body : 16px
- Small : 14px

### Composants Communs

1. **Button** :
   - Primary : Fond coloré, texte blanc
   - Secondary : Fond transparent, bordure
   - Disabled : Opacité 50%

2. **Card** :
   - Ombre légère
   - Border radius : 8px
   - Padding : 16px

3. **Input** :
   - Border : 1px solid #E1E8ED
   - Border radius : 4px
   - Padding : 12px
   - Focus : Border bleu

4. **Badge** :
   - Border radius : 12px
   - Padding : 4px 8px
   - Font size : 12px

---

## 📋 Checklist de Création Figma

### Pour chaque maquette :

- [ ] Créer le fichier Figma
- [ ] Définir les frames (Desktop/Mobile)
- [ ] Ajouter les composants de base (Header, Footer, etc.)
- [ ] Créer les composants réutilisables
- [ ] Ajouter les couleurs dans le style guide
- [ ] Ajouter les typographies
- [ ] Créer les interactions (prototype)
- [ ] Tester la navigation
- [ ] Exporter les assets nécessaires
- [ ] Documenter les spécifications

### Composants à créer :

- [ ] Button (Primary, Secondary, Disabled)
- [ ] Input (Text, Password, Email)
- [ ] Card (Stat, Content, Action)
- [ ] Badge (Status, Type, New)
- [ ] Table (Header, Row, Pagination)
- [ ] Graphique (Placeholder pour Chart.js)
- [ ] Navigation (Sidebar, Topbar, BottomNav)
- [ ] Modal (Dialog, Confirmation)
- [ ] Toast (Success, Error, Info)

---

## 🔗 Liens Figma (À créer)

Une fois les maquettes créées, ajouter les liens ici :

- TeacherConsole : `https://www.figma.com/file/...`
- StudentPortal : `https://www.figma.com/file/...`
- StudentCoach : `https://www.figma.com/file/...`

---

## 📝 Notes pour les Développeurs

Les maquettes Figma doivent être :
1. **Exportables** : Assets en PNG/SVG
2. **Mesurables** : Spacing et dimensions clairs
3. **Prototypables** : Interactions définies
4. **Responsive** : Versions Desktop/Tablet/Mobile
5. **Accessibles** : Contrastes WCAG AA

**Outils recommandés** :
- Figma pour la création
- Zeplin pour le handoff (optionnel)
- Storybook pour les composants React (optionnel)

---

**Les maquettes Figma sont essentielles pour garantir une expérience utilisateur cohérente et professionnelle !** 🎨

