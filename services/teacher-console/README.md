# TeacherConsole Microservice

## Description
Dashboard React pour les enseignants avec visualisations Chart.js pour le suivi des étudiants, alertes et analyses.

## Stack Technique
- **Framework**: React 18
- **Build Tool**: Vite
- **Visualisation**: Chart.js, react-chartjs-2
- **HTTP Client**: Axios

## Fonctionnalités

- **Dashboard principal**: Vue d'ensemble de tous les étudiants
- **Alertes**: Identification automatique des étudiants à risque
- **Graphiques**:
  - Performance des étudiants (Bar Chart)
  - Engagement (Line Chart)
  - Distribution des risques (Pie Chart)
- **Tableau détaillé**: Liste de tous les étudiants avec leurs métriques
- **Détails individuels**: Modal avec informations complètes sur un étudiant

## Installation

```bash
npm install
```

## Exécution

```bash
# Développement
npm run dev

# Production
npm run build
npm run preview
```

## Configuration

Le service se connecte à PrepaData (port 3002) par défaut. Modifier `API_BASE` dans `src/App.jsx` si nécessaire.

## Docker

```bash
docker build -t teacher-console .
docker run -p 3006:3006 teacher-console
```

## Port

Le service s'exécute sur le port **3006** par défaut.

