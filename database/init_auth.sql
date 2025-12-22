-- Script d'initialisation pour le service Auth
-- Cette table sera créée automatiquement par SQLAlchemy, mais ce script peut être utilisé pour migration manuelle

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insérer un utilisateur admin par défaut (password: admin123)
-- Le hash bcrypt pour "admin123" est: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2QoF5q5K5O
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@edupath.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LS2QoF5q5K5O',
    'Admin User',
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insérer un utilisateur étudiant par défaut (password: student123)
-- Le hash bcrypt pour "student123" est: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
    'student@edupath.com',
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Student User',
    'student',
    TRUE
) ON CONFLICT (email) DO NOTHING;

