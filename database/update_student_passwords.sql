-- Script pour mettre à jour les mots de passe des comptes étudiants
-- Mot de passe : student123 pour tous les comptes

-- Générer le hash avec Python
-- docker exec -it edupath-auth-service python -c "from src.utils.password import get_password_hash; print(get_password_hash('student123'))"

-- Mettre à jour les comptes étudiants avec student_id 12345, 12346, 12347
UPDATE users 
SET password_hash = '$2b$12$fCMBWugRtDbAO34qZjHEk.8THSI2FewhMvCbDuPtcbT8PHRxoyRPa'
WHERE email IN (
    'mohamed.alami@emsi-edu.ma',
    'fatima.benali@emsi-edu.ma',
    'youssef.kadiri@emsi-edu.ma'
);

-- Vérifier les mises à jour
SELECT id, email, full_name, student_id, role, is_active 
FROM users 
WHERE email IN (
    'mohamed.alami@emsi-edu.ma',
    'fatima.benali@emsi-edu.ma',
    'youssef.kadiri@emsi-edu.ma'
)
ORDER BY student_id;
