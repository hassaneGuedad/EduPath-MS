-- Insérer des données de test variées pour le clustering
DELETE FROM raw_student_data WHERE student_id IN ('12345', '12346', '12347');

INSERT INTO raw_student_data (student_id, lms_source, raw_data) VALUES
-- Étudiant 12345 (Mohamed Alami) → AT RISK
('12345', 'CSV', '{"module_id": "MATH101", "score": "35", "participation_rate": "0.3", "time_spent_hours": "10", "assignment_submitted": "1", "quiz_attempts": "1"}'::jsonb),
('12345', 'CSV', '{"module_id": "INFO101", "score": "40", "participation_rate": "0.35", "time_spent_hours": "12", "assignment_submitted": "2", "quiz_attempts": "2"}'::jsonb),

-- Étudiant 12346 (Fatima Benali) → HIGH PERFORMER
('12346', 'CSV', '{"module_id": "MATH101", "score": "95", "participation_rate": "0.95", "time_spent_hours": "60", "assignment_submitted": "10", "quiz_attempts": "8"}'::jsonb),
('12346', 'CSV', '{"module_id": "INFO101", "score": "92", "participation_rate": "0.9", "time_spent_hours": "55", "assignment_submitted": "9", "quiz_attempts": "7"}'::jsonb),

-- Étudiant 12347 (Youssef Kadiri) → AVERAGE LEARNER
('12347', 'CSV', '{"module_id": "MATH101", "score": "70", "participation_rate": "0.7", "time_spent_hours": "35", "assignment_submitted": "6", "quiz_attempts": "5"}'::jsonb),
('12347', 'CSV', '{"module_id": "INFO101", "score": "72", "participation_rate": "0.68", "time_spent_hours": "38", "assignment_submitted": "6", "quiz_attempts": "4"}'::jsonb);
