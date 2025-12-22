from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# URL de connexion (à adapter selon l'environnement, ici pour localhost)
# Note: Dans le conteneur c'est 'postgres', depuis l'hôte c'est 'localhost'
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://edupath:edupath123@localhost:5432/edupath_db')

def migrate():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Starting migration...")
        
        # Ajouter column first_name
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR"))
            print("Added first_name column")
        except Exception as e:
            print(f"Skipped first_name (maybe exists): {e}")

        # Ajouter column last_name
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR"))
            print("Added last_name column")
        except Exception as e:
            print(f"Skipped last_name (maybe exists): {e}")

        # Ajouter column student_id
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN student_id INTEGER"))
            conn.execute(text("CREATE UNIQUE INDEX ix_users_student_id ON users (student_id)"))
            print("Added student_id column")
        except Exception as e:
            print(f"Skipped student_id (maybe exists): {e}")

        conn.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
