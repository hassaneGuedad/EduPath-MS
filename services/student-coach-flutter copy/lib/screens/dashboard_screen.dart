import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../config/app_config.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int? studentId;
  bool _isLoadingStudentId = true;

  @override
  void initState() {
    super.initState();
    _loadStudentId();
  }

  Future<void> _loadStudentId() async {
    // Récupérer le student_id de l'utilisateur connecté
    final id = await AuthService().getStudentId();
    setState(() {
      studentId = id ?? AppConfig.currentStudentId; // Fallback sur config si pas de student_id
      _isLoadingStudentId = false;
    });
    
    // Charger les données du dashboard
    if (studentId != null && mounted) {
      Provider.of<ApiService>(context, listen: false).fetchDashboard(studentId!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Coach'),
        backgroundColor: Colors.blue,
        actions: [
          // Bouton de déconnexion
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Se déconnecter',
            onPressed: () async {
              // Confirmer la déconnexion
              final confirm = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Déconnexion'),
                  content: const Text('Voulez-vous vraiment vous déconnecter ?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Annuler'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('Déconnexion'),
                    ),
                  ],
                ),
              );

              if (confirm == true) {
                // Déconnecter
                await AuthService().logout();
                
                // Retourner à l'écran de connexion
                if (context.mounted) {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (context) => const LoginScreen(),
                    ),
                  );
                }
              }
            },
          ),
        ],
      ),
      body: _isLoadingStudentId
          ? const Center(child: CircularProgressIndicator())
          : Consumer<ApiService>(
        builder: (context, apiService, child) {
          if (apiService.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final dashboard = apiService.dashboardData?['dashboard'];
          if (dashboard == null) {
            return const Center(
              child: Text('Aucune donnée disponible'),
            );
          }

          final progress = dashboard['progress'];
          final profile = dashboard['profile'];
          final prediction = dashboard['prediction'];
          final recommendations = dashboard['recommendations'] as List<dynamic>?;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Carte de progression
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Ma Progression',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildStatRow('Score moyen', '${progress['average_score']?.toStringAsFixed(1) ?? 'N/A'}'),
                        _buildStatRow('Modules', '${progress['total_modules'] ?? 'N/A'}'),
                        _buildStatRow('Engagement', '${progress['engagement_level'] ?? 'N/A'}'),
                        _buildStatRow('Temps total', '${progress['total_time_spent']?.toStringAsFixed(1) ?? 'N/A'}h'),
                        _buildStatRow('Tendance', '${progress['performance_trend'] ?? 'N/A'}'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Profil
                if (profile != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Mon Profil',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            profile['profile_name'] ?? 'N/A',
                            style: const TextStyle(fontSize: 18),
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Prédiction
                if (prediction != null)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Prédiction de Risque',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Niveau: ${prediction['risk_level'] ?? 'N/A'}',
                            style: TextStyle(
                              fontSize: 16,
                              color: _getRiskColor(prediction['risk_level']),
                            ),
                          ),
                          Text(
                            'Probabilité de succès: ${(prediction['success_probability'] * 100)?.toStringAsFixed(1) ?? 'N/A'}%',
                          ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 16),

                // Recommandations
                if (recommendations != null && recommendations.isNotEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Recommandations',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ...recommendations.map((rec) => ListTile(
                                title: Text(rec['resource_name'] ?? ''),
                                subtitle: Text(rec['description'] ?? ''),
                                trailing: Text(rec['resource_type'] ?? ''),
                              )),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Color _getRiskColor(String? riskLevel) {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      case 'low':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}

