import 'package:flutter/foundation.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiService extends ChangeNotifier {
  final String baseUrl = AppConfig.apiBaseUrl;
  bool isLoading = false;
  Map<String, dynamic>? dashboardData;

  Future<Map<String, dynamic>?> fetchDashboard(int studentId) async {
    isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/student/$studentId/dashboard'),
      );

      if (response.statusCode == 200) {
        dashboardData = json.decode(response.body);
        isLoading = false;
        notifyListeners();
        return dashboardData;
      } else {
        isLoading = false;
        notifyListeners();
        return null;
      }
    } catch (e) {
      print('Erreur: $e');
      isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<List<dynamic>?> fetchRecommendations(int studentId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/student/$studentId/recommendations?top_k=5'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['recommendations'] as List<dynamic>;
      }
      return null;
    } catch (e) {
      print('Erreur: $e');
      return null;
    }
  }
}

