// Configuration pour l'application StudentCoach Flutter

class AppConfig {
  // ID de l'étudiant actuellement connecté
  // Changez cette valeur pour tester différents profils :
  // - 12345 : At Risk (37.67%) - Besoin d'aide urgente
  // - 12346 : High Performer (95%) - Excellence
  // - 12347 : Average Learner (70%) - Performance moyenne
  static const int currentStudentId = 12345;
  
  // URL de base de l'API StudentCoach
  static const String apiBaseUrl = 'http://localhost:3007';
  
  // URL de base de l'API d'authentification
  static const String authBaseUrl = 'http://localhost:3008';
  
  // Configuration API
  static const Duration apiTimeout = Duration(seconds: 10);
  static const int recommendationsLimit = 5;
}
