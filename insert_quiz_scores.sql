-- Créer des quiz scores variés pour le clustering

-- Étudiant 12345 (Mohamed Alami) → AT RISK
DELETE FROM quiz_scores WHERE student_id = 12345;
INSERT INTO quiz_scores (student_id, quiz_id, score, points, max_points, passed) VALUES
(12345, 'QUIZ-1765674996060', 35, 35, 100, FALSE),
(12345, 'QUIZ-1765674996060', 40, 40, 100, FALSE),
(12345, 'QUIZ-1765674996060', 38, 38, 100, FALSE);

-- Étudiant 12346 (Fatima Benali) → HIGH PERFORMER  
DELETE FROM quiz_scores WHERE student_id = 12346;
INSERT INTO quiz_scores (student_id, quiz_id, score, points, max_points, passed) VALUES
(12346, 'QUIZ-1765674996060', 95, 95, 100, TRUE),
(12346, 'QUIZ-1765674996060', 92, 92, 100, TRUE),
(12346, 'QUIZ-1765674996060', 98, 98, 100, TRUE);

-- Étudiant 12347 (Youssef Kadiri) → AVERAGE LEARNER
DELETE FROM quiz_scores WHERE student_id = 12347;
INSERT INTO quiz_scores (student_id, quiz_id, score, points, max_points, passed) VALUES
(12347, 'QUIZ-1765674996060', 70, 70, 100, TRUE),
(12347, 'QUIZ-1765674996060', 72, 72, 100, TRUE),
(12347, 'QUIZ-1765674996060', 68, 68, 100, TRUE);
