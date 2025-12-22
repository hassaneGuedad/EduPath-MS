"""
Moteur de coaching personnalisé pour générer des conseils et messages motivants
"""

def generate_motivational_message(profile_type: str, score: float, trend: str, engagement: str):
    """Génère un message motivant basé sur le profil et les performances"""
    
    messages = {
        'High Performer': {
            'high': [
                "🏆 Excellent travail ! Tu es un modèle de réussite. Continue comme ça !",
                "🌟 Tu es au sommet ! Ton engagement et ta persévérance sont exemplaires.",
                "🎯 Performance exceptionnelle ! Tu inspires tes camarades par ton excellence.",
                "💎 Bravo champion ! Ton niveau de maîtrise est impressionnant.",
            ],
            'medium': [
                "💪 Bon travail ! Tu maintiens un très bon niveau, continue sur cette lancée !",
                "🎯 Tu progresses bien ! Quelques petits efforts et tu seras au top !",
                "⭐ Excellente régularité ! Tu es sur la bonne voie.",
            ],
            'low': [
                "⚠️ Attention ! Tu es capable de beaucoup mieux. Reprenons ensemble !",
                "💡 Petit creux passager ? Concentre-toi sur les fondamentaux.",
                "🔄 Rebondis ! Ton potentiel est bien plus grand, je crois en toi.",
            ]
        },
        'Average Learner': {
            'high': [
                "🚀 Super progression ! Continue, tu es sur une excellente trajectoire !",
                "💪 Bravo ! Tes efforts portent leurs fruits. Ne lâche rien !",
                "⭐ Excellent ! Tu prouves que la persévérance paie toujours.",
                "🌱 Belle évolution ! Continue à cultiver tes compétences.",
            ],
            'medium': [
                "👍 Bon travail ! Tu progresses régulièrement, c'est l'essentiel.",
                "💡 Tu es sur la bonne voie ! Reste concentré sur tes objectifs.",
                "🎯 Continue comme ça ! Chaque effort compte pour ta réussite.",
                "⚡ Tu avances bien ! La régularité est la clé du succès.",
            ],
            'low': [
                "💪 Ne te décourage pas ! Chaque difficulté est une opportunité d'apprendre.",
                "🌟 Tu peux y arriver ! Concentre-toi sur un objectif à la fois.",
                "🔥 Remotive-toi ! Le succès est fait de petits pas quotidiens.",
                "💡 Crois en toi ! Tu as toutes les capacités pour réussir.",
            ]
        },
        'At Risk': {
            'high': [
                "🎉 Excellent redressement ! Continue, tu remontes la pente avec brio !",
                "💪 Bravo pour ta persévérance ! Tes efforts commencent à payer.",
                "🌟 Super progression ! Tu prouves que rien n'est impossible.",
                "🚀 Continue sur cette lancée ! Tu es en train de tout changer.",
            ],
            'medium': [
                "💡 Bien ! Tu commences à trouver ton rythme. Persévère !",
                "👍 Des progrès visibles ! Continue à fournir ces efforts.",
                "⭐ Tu avances ! Chaque petit pas compte énormément.",
                "🌱 Courage ! Tu es sur le bon chemin vers la réussite.",
            ],
            'low': [
                "🆘 Attention ! Il est temps d'agir. Je suis là pour t'aider !",
                "💪 N'abandonne JAMAIS ! Ensemble, on va surmonter ces difficultés.",
                "🌟 Tu n'es pas seul ! Demande de l'aide, c'est le premier pas vers la réussite.",
                "🔥 Accroche-toi ! Chaque effort, même petit, te rapproche de ton objectif.",
                "💡 SOS réussite ! Contacte ton tuteur maintenant, il peut tout changer.",
            ]
        }
    }
    
    # Déterminer la plage de score
    if score >= 85:
        score_range = 'high'
    elif score >= 50:
        score_range = 'medium'
    else:
        score_range = 'low'
    
    # Sélectionner un message
    import random
    profile_messages = messages.get(profile_type, messages['Average Learner'])
    range_messages = profile_messages.get(score_range, profile_messages['medium'])
    
    message = random.choice(range_messages)
    
    # Ajouter un complément basé sur la tendance
    if trend == 'Improving':
        message += " 📈 Ta progression est remarquable !"
    elif trend == 'Declining':
        message += " ⚠️ Attention à ne pas relâcher tes efforts."
    
    return message


def generate_coaching_advice(student_features: dict, profile: dict):
    """Génère des conseils de coaching personnalisés"""
    
    advice_list = []
    
    score = student_features.get('average_score', 0)
    participation = student_features.get('average_participation', 0)
    time_spent = student_features.get('total_time_spent', 0)
    engagement = student_features.get('engagement_level', 'Low')
    risk_score = student_features.get('risk_score', 0)
    trend = student_features.get('performance_trend', 'Stable')
    
    # Conseils basés sur le score
    if score < 50:
        advice_list.append({
            'type': 'urgent',
            'icon': '🆘',
            'title': 'Score critique',
            'advice': "Ton score nécessite une attention immédiate. Commence par réviser les concepts de base et n'hésite pas à demander de l'aide à ton tuteur.",
            'action': "Planifie une séance de tutorat cette semaine"
        })
    elif score < 70:
        advice_list.append({
            'type': 'warning',
            'icon': '⚠️',
            'title': 'Score à améliorer',
            'advice': "Tu peux faire mieux ! Identifie tes points faibles et concentre-toi sur ces sujets en priorité.",
            'action': "Révise 30 minutes par jour sur tes points faibles"
        })
    elif score >= 85:
        advice_list.append({
            'type': 'success',
            'icon': '🏆',
            'title': 'Excellent niveau',
            'advice': "Continue ton excellent travail ! Tu peux maintenant aider tes camarades et approfondir des sujets avancés.",
            'action': "Explore des ressources complémentaires pour aller plus loin"
        })
    
    # Conseils basés sur la participation
    if participation < 0.3:
        advice_list.append({
            'type': 'warning',
            'icon': '📚',
            'title': 'Participation faible',
            'advice': "Ta participation est très basse. L'engagement actif est essentiel pour la réussite. Participe plus aux activités proposées.",
            'action': "Fixe-toi l'objectif de compléter au moins 3 activités cette semaine"
        })
    elif participation >= 0.8:
        advice_list.append({
            'type': 'success',
            'icon': '⭐',
            'title': 'Excellent engagement',
            'advice': "Ta participation est exemplaire ! Continue à être aussi investi dans ton apprentissage.",
            'action': "Maintiens ce rythme et partage tes stratégies avec tes camarades"
        })
    
    # Conseils basés sur le temps passé
    if time_spent < 20:
        advice_list.append({
            'type': 'warning',
            'icon': '⏰',
            'title': 'Temps d\'étude insuffisant',
            'advice': "Tu passes trop peu de temps sur la plateforme. Pour progresser, il faut investir plus de temps dans ton apprentissage.",
            'action': "Bloque 1 heure par jour dans ton agenda pour étudier"
        })
    
    # Conseils basés sur le risque
    if risk_score > 60:
        advice_list.append({
            'type': 'urgent',
            'icon': '🚨',
            'title': 'Risque d\'échec élevé',
            'advice': "ALERTE ! Tu es en situation de risque élevé d'échec. Il est crucial d'agir MAINTENANT. Contacte immédiatement ton tuteur pour un plan d'action personnalisé.",
            'action': "Prends rendez-vous avec ton tuteur dans les 48h"
        })
    elif risk_score > 40:
        advice_list.append({
            'type': 'warning',
            'icon': '⚠️',
            'title': 'Risque modéré',
            'advice': "Attention, tu es dans une zone de risque. Augmente tes efforts maintenant pour éviter les difficultés.",
            'action': "Révise 45 minutes chaque jour et fais tous les exercices proposés"
        })
    
    # Conseils basés sur la tendance
    if trend == 'Declining':
        advice_list.append({
            'type': 'warning',
            'icon': '📉',
            'title': 'Tendance à la baisse',
            'advice': "Tes performances sont en baisse. Identifie rapidement ce qui ne va pas : fatigue, manque de temps, difficultés de compréhension ?",
            'action': "Fais le point sur ce qui t'empêche de progresser et adapte ta méthode"
        })
    elif trend == 'Improving':
        advice_list.append({
            'type': 'success',
            'icon': '📈',
            'title': 'Belle progression',
            'advice': "Tes performances s'améliorent ! Continue ce que tu fais, ça fonctionne bien.",
            'action': "Maintiens ton rythme actuel et note ce qui t'aide à progresser"
        })
    
    # Conseils basés sur le profil ML
    profile_type = profile.get('profile_name', 'Average Learner')
    
    if profile_type == 'At Risk':
        advice_list.append({
            'type': 'urgent',
            'icon': '💪',
            'title': 'Plan de rattrapage',
            'advice': "Ton profil indique que tu as besoin d'un accompagnement renforcé. Crée un planning d'étude structuré et respecte-le rigoureusement.",
            'action': "Télécharge le guide 'Réussir avec un plan de rattrapage'"
        })
    elif profile_type == 'High Performer':
        advice_list.append({
            'type': 'info',
            'icon': '🎯',
            'title': 'Défi supplémentaire',
            'advice': "Tu maîtrises bien le contenu. Challenge-toi avec des exercices plus complexes ou aide tes camarades en difficulté.",
            'action': "Rejoins le programme de mentorat pour aider d'autres étudiants"
        })
    
    # Conseil général si la liste est vide
    if not advice_list:
        advice_list.append({
            'type': 'info',
            'icon': '📖',
            'title': 'Continue ton apprentissage',
            'advice': "Tu progresses régulièrement. Maintiens ton effort et ton engagement pour continuer à t'améliorer.",
            'action': "Consulte les nouvelles ressources ajoutées cette semaine"
        })
    
    return advice_list


def generate_study_plan(student_features: dict, weak_modules: list = None):
    """Génère un plan d'étude personnalisé"""
    
    score = student_features.get('average_score', 0)
    risk_score = student_features.get('risk_score', 0)
    
    study_plan = {
        'duration_per_day': 0,
        'weekly_sessions': 0,
        'priorities': [],
        'suggested_schedule': []
    }
    
    # Déterminer l'intensité nécessaire
    if risk_score > 60 or score < 50:
        study_plan['duration_per_day'] = 90  # minutes
        study_plan['weekly_sessions'] = 6
        study_plan['priorities'] = ['Révision des fondamentaux', 'Exercices pratiques', 'Tutorat hebdomadaire']
    elif risk_score > 40 or score < 70:
        study_plan['duration_per_day'] = 60
        study_plan['weekly_sessions'] = 5
        study_plan['priorities'] = ['Consolidation des acquis', 'Pratique régulière', 'Révisions ciblées']
    else:
        study_plan['duration_per_day'] = 45
        study_plan['weekly_sessions'] = 4
        study_plan['priorities'] = ['Approfondissement', 'Projets personnels', 'Entraide']
    
    # Planning suggéré
    study_plan['suggested_schedule'] = [
        {'day': 'Lundi', 'focus': 'Révision théorie', 'duration': study_plan['duration_per_day']},
        {'day': 'Mardi', 'focus': 'Exercices pratiques', 'duration': study_plan['duration_per_day']},
        {'day': 'Mercredi', 'focus': 'Projet/Application', 'duration': study_plan['duration_per_day']},
        {'day': 'Jeudi', 'focus': 'Points faibles', 'duration': study_plan['duration_per_day']},
        {'day': 'Vendredi', 'focus': 'Quiz et tests', 'duration': study_plan['duration_per_day']},
    ]
    
    return study_plan
