-- Créer la table resource_views pour suivre quelles ressources ont été vues par quel étudiant
CREATE TABLE IF NOT EXISTS resource_views (
    id SERIAL PRIMARY KEY,
    resource_id VARCHAR NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL,
    student_email VARCHAR,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, student_id)  -- Un étudiant ne peut voir une ressource qu'une fois
);

CREATE INDEX IF NOT EXISTS idx_resource_views_student ON resource_views(student_id);
CREATE INDEX IF NOT EXISTS idx_resource_views_resource ON resource_views(resource_id);

-- Commentaires pour documentation
COMMENT ON TABLE resource_views IS 'Suivi des ressources consultées par chaque étudiant';
COMMENT ON COLUMN resource_views.resource_id IS 'ID de la ressource consultée';
COMMENT ON COLUMN resource_views.student_id IS 'ID de l''étudiant qui a consulté la ressource';
COMMENT ON COLUMN resource_views.viewed_at IS 'Date et heure de la première consultation';
