-- Création des tables modules et subjects

CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    module_id VARCHAR(255) UNIQUE NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    credits INTEGER DEFAULT 0,
    difficulty_level VARCHAR(50) DEFAULT 'Intermediate',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    subject_id VARCHAR(255) UNIQUE NOT NULL,
    module_id VARCHAR(255) NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    description TEXT,
    hours INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subjects_module_id ON subjects(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_module_id ON modules(module_id);
