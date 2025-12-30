# StudentCoach Flutter App

## Description
Application mobile Flutter pour les étudiants, affichant leur progression, recommandations et prédictions de risque.

## Stack Technique
- **Framework**: Flutter 3.0+
- **State Management**: Provider
- **HTTP Client**: http package
- **Charts**: charts_flutter

## Fonctionnalités

- **Dashboard**: Vue d'ensemble de la progression
- **Profil**: Affichage du profil d'apprentissage
- **Prédictions**: Visualisation du risque d'échec
- **Recommandations**: Liste des ressources recommandées

## Installation

```bash
flutter pub get
```

## Exécution

```bash
# Android
flutter run

# iOS
flutter run -d ios

# Web
flutter run -d chrome
```

## Configuration

Modifier `baseUrl` dans `lib/services/api_service.dart` pour pointer vers l'API FastAPI.

## Structure

```
lib/
  main.dart              # Point d'entrée
  services/
    api_service.dart     # Service API
  screens/
    dashboard_screen.dart # Écran principal
```

## Notes

Cette application nécessite que l'API FastAPI (student-coach-api) soit en cours d'exécution.

