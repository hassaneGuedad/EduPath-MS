import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class AuthService {
  final String authUrl = AppConfig.authBaseUrl;

  /// Se connecter avec email et mot de passe
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$authUrl/auth/login'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {
          'username': email,
          'password': password,
        },
      ).timeout(
        Duration(seconds: 10),
        onTimeout: () => throw Exception('Délai de connexion expiré'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final token = data['access_token'];

        // Sauvegarder le token
        await saveToken(token);

        // Récupérer les infos utilisateur
        final userInfo = await getUserInfo(token);
        
        // Sauvegarder les infos utilisateur (student_id, email)
        if (userInfo != null) {
          await saveUserInfo(userInfo);
        }

        return {
          'success': true,
          'token': token,
          'user': userInfo,
        };
      } else {
        return {
          'success': false,
          'message': 'Email ou mot de passe incorrect',
        };
      }
    } catch (e) {
      print('Erreur de connexion: $e');
      return {
        'success': false,
        'message': 'Erreur de connexion au serveur',
      };
    }
  }

  /// Récupérer les informations de l'utilisateur connecté
  Future<Map<String, dynamic>?> getUserInfo(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$authUrl/auth/me'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
      return null;
    } catch (e) {
      print('Erreur récupération info user: $e');
      return null;
    }
  }

  /// Sauvegarder le token localement
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  /// Récupérer le token sauvegardé
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  /// Vérifier si l'utilisateur est connecté
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    if (token == null) return false;

    // Vérifier si le token est toujours valide
    final userInfo = await getUserInfo(token);
    return userInfo != null;
  }

  /// Se déconnecter
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('student_id');
    await prefs.remove('user_email');
  }

  /// Sauvegarder les infos utilisateur
  Future<void> saveUserInfo(Map<String, dynamic> userInfo) async {
    final prefs = await SharedPreferences.getInstance();
    if (userInfo['student_id'] != null) {
      await prefs.setInt('student_id', userInfo['student_id']);
    }
    if (userInfo['email'] != null) {
      await prefs.setString('user_email', userInfo['email']);
    }
  }

  /// Récupérer le student_id de l'utilisateur connecté
  Future<int?> getStudentId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('student_id');
  }
}
