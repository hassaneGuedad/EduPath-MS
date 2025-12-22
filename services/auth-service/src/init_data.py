"""
Script d'initialisation pour créer les comptes par défaut
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, User
from utils.password import get_password_hash

def init_default_users():
    """Crée les utilisateurs par défaut s'ils n'existent pas"""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Compte admin
        admin = db.query(User).filter(User.email == "admin@edupath.com").first()
        if not admin:
            admin = User(
                email="admin@edupath.com",
                password_hash=get_password_hash("admin123"),
                full_name="Admin User",
                role="admin",
                is_active=True
            )
            db.add(admin)
            print("✅ Compte admin créé")
        else:
            print("ℹ️  Compte admin existe déjà")
        
        # Compte étudiant
        student = db.query(User).filter(User.email == "student@edupath.com").first()
        if not student:
            student = User(
                email="student@edupath.com",
                password_hash=get_password_hash("student123"),
                full_name="Student User",
                role="student",
                is_active=True
            )
            db.add(student)
            print("✅ Compte étudiant créé")
        else:
            print("ℹ️  Compte étudiant existe déjà")
        
        db.commit()
        print("🎉 Initialisation terminée")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_default_users()

