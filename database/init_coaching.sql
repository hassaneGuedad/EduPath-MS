-- Script d'initialisation de la base de données pour StudentCoach
-- Base de données : edupath_coaching

-- Table pour les sessions de coaching
CREATE TABLE IF NOT EXISTS student_coaching_sessions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    session_date TIMESTAMP DEFAULT NOW(),
    message_sent TEXT,
    advice_given TEXT,
    student_feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_coaching_student_id ON student_coaching_sessions(student_id);
CREATE INDEX idx_coaching_session_date ON student_coaching_sessions(session_date DESC);

-- Table pour les messages motivants
CREATE TABLE IF NOT EXISTS motivational_messages (
    id SERIAL PRIMARY KEY,
    profile_type VARCHAR(50) NOT NULL CHECK (profile_type IN ('High Performer', 'Average Learner', 'At Risk')),
    score_range VARCHAR(20) NOT NULL CHECK (score_range IN ('high', 'medium', 'low')),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les messages
CREATE INDEX idx_messages_profile_score ON motivational_messages(profile_type, score_range);

-- Table pour les évaluations des recommandations
CREATE TABLE IF NOT EXISTS recommendation_ratings (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    resource_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, resource_name)
);

-- Index pour les évaluations
CREATE INDEX idx_ratings_student_id ON recommendation_ratings(student_id);
CREATE INDEX idx_ratings_resource ON recommendation_ratings(resource_name);

-- Insertion des messages motivants

-- High Performer - High Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('High Performer', 'high', '🏆 Excellent travail ! Tu es un modèle de réussite. Continue comme ça !'),
('High Performer', 'high', '🌟 Tu es au sommet ! Ton engagement et ta persévérance sont exemplaires.'),
('High Performer', 'high', '🎯 Performance exceptionnelle ! Tu inspires tes camarades par ton excellence.'),
('High Performer', 'high', '💎 Bravo champion ! Ton niveau de maîtrise est impressionnant.');

-- High Performer - Medium Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('High Performer', 'medium', '💪 Bon travail ! Tu maintiens un très bon niveau, continue sur cette lancée !'),
('High Performer', 'medium', '🎯 Tu progresses bien ! Quelques petits efforts et tu seras au top !'),
('High Performer', 'medium', '⭐ Excellente régularité ! Tu es sur la bonne voie.');

-- High Performer - Low Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('High Performer', 'low', '⚠️ Attention ! Tu es capable de beaucoup mieux. Reprenons ensemble !'),
('High Performer', 'low', '💡 Petit creux passager ? Concentre-toi sur les fondamentaux.'),
('High Performer', 'low', '🔄 Rebondis ! Ton potentiel est bien plus grand, je crois en toi.');

-- Average Learner - High Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('Average Learner', 'high', '🚀 Super progression ! Continue, tu es sur une excellente trajectoire !'),
('Average Learner', 'high', '💪 Bravo ! Tes efforts portent leurs fruits. Ne lâche rien !'),
('Average Learner', 'high', '⭐ Excellent ! Tu prouves que la persévérance paie toujours.'),
('Average Learner', 'high', '🌱 Belle évolution ! Continue à cultiver tes compétences.');

-- Average Learner - Medium Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('Average Learner', 'medium', '👍 Bon travail ! Tu progresses régulièrement, c''est l''essentiel.'),
('Average Learner', 'medium', '💡 Tu es sur la bonne voie ! Reste concentré sur tes objectifs.'),
('Average Learner', 'medium', '🎯 Continue comme ça ! Chaque effort compte pour ta réussite.'),
('Average Learner', 'medium', '⚡ Tu avances bien ! La régularité est la clé du succès.');

-- Average Learner - Low Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('Average Learner', 'low', '💪 Ne te décourage pas ! Chaque difficulté est une opportunité d''apprendre.'),
('Average Learner', 'low', '🌟 Tu peux y arriver ! Concentre-toi sur un objectif à la fois.'),
('Average Learner', 'low', '🔥 Remotive-toi ! Le succès est fait de petits pas quotidiens.'),
('Average Learner', 'low', '💡 Crois en toi ! Tu as toutes les capacités pour réussir.');

-- At Risk - High Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('At Risk', 'high', '🎉 Excellent redressement ! Continue, tu remontes la pente avec brio !'),
('At Risk', 'high', '💪 Bravo pour ta persévérance ! Tes efforts commencent à payer.'),
('At Risk', 'high', '🌟 Super progression ! Tu prouves que rien n''est impossible.'),
('At Risk', 'high', '🚀 Continue sur cette lancée ! Tu es en train de tout changer.');

-- At Risk - Medium Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('At Risk', 'medium', '💡 Bien ! Tu commences à trouver ton rythme. Persévère !'),
('At Risk', 'medium', '👍 Des progrès visibles ! Continue à fournir ces efforts.'),
('At Risk', 'medium', '⭐ Tu avances ! Chaque petit pas compte énormément.'),
('At Risk', 'medium', '🌱 Courage ! Tu es sur le bon chemin vers la réussite.');

-- At Risk - Low Score
INSERT INTO motivational_messages (profile_type, score_range, message) VALUES
('At Risk', 'low', '🆘 Attention ! Il est temps d''agir. Je suis là pour t''aider !'),
('At Risk', 'low', '💪 N''abandonne JAMAIS ! Ensemble, on va surmonter ces difficultés.'),
('At Risk', 'low', '🌟 Tu n''es pas seul ! Demande de l''aide, c''est le premier pas vers la réussite.'),
('At Risk', 'low', '🔥 Accroche-toi ! Chaque effort, même petit, te rapproche de ton objectif.'),
('At Risk', 'low', '💡 SOS réussite ! Contacte ton tuteur maintenant, il peut tout changer.');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour student_coaching_sessions
CREATE TRIGGER update_coaching_sessions_updated_at 
BEFORE UPDATE ON student_coaching_sessions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Vues utiles
CREATE OR REPLACE VIEW student_coaching_summary AS
SELECT 
    student_id,
    COUNT(*) as total_sessions,
    AVG(rating) as average_rating,
    MAX(session_date) as last_session_date,
    COUNT(CASE WHEN student_feedback IS NOT NULL THEN 1 END) as feedback_count
FROM student_coaching_sessions
GROUP BY student_id;

CREATE OR REPLACE VIEW recent_coaching_activity AS
SELECT 
    scs.id,
    scs.student_id,
    scs.session_date,
    scs.message_sent,
    scs.rating,
    CASE 
        WHEN scs.student_feedback IS NOT NULL THEN 'Avec feedback'
        ELSE 'Sans feedback'
    END as feedback_status
FROM student_coaching_sessions scs
ORDER BY scs.session_date DESC
LIMIT 100;

-- Afficher un résumé
SELECT 'Base de données coaching initialisée avec succès' as status;
SELECT COUNT(*) as total_messages FROM motivational_messages;
