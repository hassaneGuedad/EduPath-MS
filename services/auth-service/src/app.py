from fastapi import FastAPI, Depends, HTTPException, status, Query, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional, List, List
import os
from dotenv import load_dotenv
import pathlib

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import get_db, engine
from models import Base, User, Resource, Quiz, QuizQuestion, StudentQuizResponse, QuizScore, Module, Subject
from utils.password import verify_password, get_password_hash
from utils.jwt import create_access_token, verify_token

load_dotenv()

app = FastAPI(title="Auth Service", version="1.0.0")

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3006",      # Teacher Console
        "http://localhost:3009",      # Student Portal
        "http://localhost:3001",      # LMS Connector
        "http://localhost:*",         # All localhost ports
        "http://127.0.0.1:*",         # 127.0.0.1 all ports
        "*"                           # Allow all in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Créer les tables
Base.metadata.create_all(bind=engine)

# Initialiser les comptes par défaut (en arrière-plan après démarrage)
import threading
def init_users_background():
    import time
    time.sleep(3)  # Attendre que la DB soit prête
    try:
        from init_data import init_default_users
        init_default_users()
    except Exception as e:
        print(f"Erreur lors de l'initialisation: {e}")

threading.Thread(target=init_users_background, daemon=True).start()

# Auto-migration pour mise à jour du schéma
from sqlalchemy import text
def check_and_migrate_db():
    try:
        # Attendre que la DB soit prête
        import time
        time.sleep(5)
        
        db = next(get_db())
        print("Checking DB schema compatibility...")
        
        # Vérifier et ajouter les colonnes manquantes
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN first_name VARCHAR"))
            print("Added first_name column")
            db.commit()
        except Exception:
            db.rollback()
            
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN last_name VARCHAR"))
            print("Added last_name column")
            db.commit()
        except Exception:
            db.rollback()
            
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN student_id INTEGER"))
            print("Added student_id column")
            db.commit()
        except Exception:
            db.rollback()
            
        try:
            db.execute(text("CREATE UNIQUE INDEX ix_users_student_id ON users (student_id)"))
            print("Added index on student_id")
            db.commit()
        except Exception:
            db.rollback()
            
        print("DB schema check complete.")
    except Exception as e:
        print(f"Schema migration error (harmless if already up to date): {e}")

threading.Thread(target=check_and_migrate_db, daemon=True).start()

PORT = int(os.getenv('PORT', 3008))
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Modèles Pydantic
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    student_id: Optional[int] = None
    role: str = "student"  # admin, teacher, student

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    student_id: Optional[int] = None
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class ResourceCreate(BaseModel):
    resource_id: str
    title: str
    description: Optional[str] = None
    resource_type: str
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    difficulty_level: Optional[str] = None
    duration: Optional[int] = None
    author: Optional[str] = None
    external_url: Optional[str] = None
    file_path: Optional[str] = None
    content: Optional[str] = None
    tags: List[str] = []
    is_viewed: bool = False

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    difficulty_level: Optional[str] = None
    duration: Optional[int] = None
    author: Optional[str] = None
    external_url: Optional[str] = None
    file_path: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    is_viewed: Optional[bool] = None

class ResourceResponse(BaseModel):
    id: int
    resource_id: str
    title: str
    description: Optional[str]
    resource_type: str
    subject_id: Optional[str]
    subject_name: Optional[str]
    difficulty_level: Optional[str]
    duration: Optional[int]
    author: Optional[str]
    external_url: Optional[str]
    file_path: Optional[str]
    tags: List[str]
    is_viewed: bool
    content: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============ MODULE & SUBJECT MODELS ============

class ModuleCreate(BaseModel):
    module_id: str
    module_name: str
    category: Optional[str] = None
    credits: int = 0
    difficulty_level: str = "Intermediate"
    description: Optional[str] = None

class ModuleUpdate(BaseModel):
    module_name: Optional[str] = None
    category: Optional[str] = None
    credits: Optional[int] = None
    difficulty_level: Optional[str] = None
    description: Optional[str] = None

class ModuleResponse(BaseModel):
    id: int
    module_id: str
    module_name: str
    category: Optional[str]
    credits: int
    difficulty_level: str
    description: Optional[str]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    subject_id: str
    module_id: str
    subject_name: str
    description: Optional[str] = None
    hours: int = 0

class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = None
    description: Optional[str] = None
    hours: Optional[int] = None

class SubjectResponse(BaseModel):
    id: int
    subject_id: str
    module_id: str
    subject_name: str
    description: Optional[str]
    hours: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ============ QUIZ MODELS ============

class QuizQuestionCreate(BaseModel):
    question_number: int
    question_text: str
    question_type: str = "multiple_choice"  # multiple_choice, true_false, short_answer
    options: Optional[List[str]] = None
    correct_answer: str
    points: float = 1.0
    explanation: Optional[str] = None

class QuizQuestionResponse(BaseModel):
    id: int
    quiz_id: str
    question_number: int
    question_text: str
    question_type: str
    options: Optional[List[str]]
    points: float
    explanation: Optional[str]

    class Config:
        from_attributes = True

class QuizCreate(BaseModel):
    quiz_id: str
    resource_id: str
    title: str
    description: Optional[str] = None
    passing_score: float = 50.0
    duration_minutes: Optional[int] = None
    questions: Optional[List[QuizQuestionCreate]] = []

class QuizResponse(BaseModel):
    id: int
    quiz_id: str
    resource_id: str
    title: str
    description: Optional[str]
    total_questions: int
    passing_score: float
    duration_minutes: Optional[int]
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentQuizResponseCreate(BaseModel):
    quiz_id: str
    student_id: int
    student_email: Optional[str] = None
    responses: List[dict]  # [{question_id: int, answer: str}, ...]

class QuizScoreResponse(BaseModel):
    quiz_id: str
    student_id: int
    student_email: Optional[str]
    score: float
    points: float
    max_points: float
    passed: bool
    attempt_number: int
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class AdminCreateStudentRequest(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    student_id: Optional[int] = None
    send_email: Optional[bool] = False  # Option pour envoyer l'email automatiquement

class AdminCreateStudentResponse(BaseModel):
    user: UserResponse
    temporary_password: str
    email_sent: Optional[bool] = False  # Indique si l'email a été envoyé

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    student_id: Optional[int] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# Dépendances
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token, credentials_exception)
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

# Routes
@app.get("/")
async def root():
    return {"message": "Auth Service", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "AuthService"}

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Vérifier si l'utilisateur existe déjà
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Générer full_name si first_name et last_name sont fournis
    full_name = user_data.full_name
    if not full_name and user_data.first_name and user_data.last_name:
        full_name = f"{user_data.first_name} {user_data.last_name}"
    elif not full_name:
        full_name = user_data.email.split('@')[0]  # Fallback
    
    # Créer nouvel utilisateur
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=full_name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        student_id=user_data.student_id,
        role=user_data.role,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Vérifier l'utilisateur
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Créer token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/auth/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Changer le mot de passe de l'utilisateur connecté"""
    # Vérifier l'ancien mot de passe
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ancien mot de passe incorrect"
        )
    
    # Vérifier que le nouveau mot de passe est différent
    if password_data.old_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit être différent de l'ancien"
        )
    
    # Mettre à jour le mot de passe
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"detail": "Mot de passe changé avec succès"}

@app.get("/users", response_model=list[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Seuls les admins peuvent voir tous les utilisateurs
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admin peut voir tous, autres peuvent voir seulement leur propre profil
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@app.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mettre à jour un utilisateur (admin ou l'utilisateur lui-même)"""
    # Vérifier les permissions
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Trouver l'utilisateur
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Mettre à jour les champs si fournis
    update_data = user_update.dict(exclude_unset=True)
    
    # Vérifier l'email unique si modifié
    if "email" in update_data and update_data["email"] != user.email:
        existing = db.query(User).filter(User.email == update_data["email"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Vérifier student_id unique si modifié
    if "student_id" in update_data and update_data["student_id"] != user.student_id:
        existing = db.query(User).filter(User.student_id == update_data["student_id"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID already in use"
            )
    
    # Appliquer les modifications
    for field, value in update_data.items():
        if field != "password":  # Le mot de passe se change via /auth/change-password
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Supprimer un utilisateur (admin uniquement)"""
    # Seul l'admin peut supprimer
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    # Trouver l'utilisateur
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Ne pas se supprimer soi-même
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Supprimer l'utilisateur
    db.delete(user)
    db.commit()
    
    return None

@app.post("/auth/admin/create-student", response_model=AdminCreateStudentResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_student(
    user_data: AdminCreateStudentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Endpoint réservé aux admins pour créer des comptes étudiants avec mot de passe aléatoire"""
    # Vérifier que l'utilisateur actuel est admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create student accounts"
        )
    
    # Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Vérifier si student_id existe déjà (si fourni)
    if user_data.student_id:
        existing_student = db.query(User).filter(User.student_id == user_data.student_id).first()
        if existing_student:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID already exists"
            )
    
    # Générer un mot de passe aléatoire
    import secrets
    import string
    alphabet = string.ascii_letters + string.digits
    temporary_password = ''.join(secrets.choice(alphabet) for i in range(12))
    
    # Générer full_name
    full_name = user_data.full_name
    if not full_name and user_data.first_name and user_data.last_name:
        full_name = f"{user_data.first_name} {user_data.last_name}"
    elif not full_name:
        full_name = user_data.email.split('@')[0]
    
    # Créer l'étudiant avec le mot de passe temporaire
    hashed_password = get_password_hash(temporary_password)
    new_student = User(
        email=user_data.email,
        password_hash=hashed_password,
        full_name=full_name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        student_id=user_data.student_id,
        role="student",  # Force le rôle à student
        is_active=True
    )
    
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Envoyer l'email si demandé
    email_sent = False
    if user_data.send_email:
        try:
            from utils.email_service import send_credentials_email
            email_sent = await send_credentials_email(
                to_email=user_data.email,
                student_name=full_name,
                temporary_password=temporary_password
            )
        except Exception as e:
            print(f"⚠️ Erreur lors de l'envoi de l'email: {str(e)}")
            # On ne bloque pas la création du compte si l'email échoue
            email_sent = False
    
    # Retourner l'étudiant ET le mot de passe temporaire
    return AdminCreateStudentResponse(
        user=new_student,
        temporary_password=temporary_password,
        email_sent=email_sent
    )


@app.post("/auth/admin/import-students")
async def admin_import_students(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import en masse d'étudiants depuis un fichier CSV
    Format attendu: Email,Prénom,Nom,N° Étudiant
    """
    # Vérifier que l'utilisateur actuel est admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can import students"
        )
    
    # Vérifier le type de fichier
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported"
        )
    
    try:
        # Lire le contenu du fichier
        contents = await file.read()
        decoded = contents.decode('utf-8-sig')  # utf-8-sig pour gérer le BOM
        lines = decoded.strip().split('\n')
        
        if len(lines) < 2:  # Au moins l'en-tête + 1 ligne de données
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Le fichier doit contenir au moins une ligne de données"
            )
        
        # Ignorer la première ligne (en-tête)
        data_lines = lines[1:]
        
        created_students = []
        errors = []
        
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits
        
        for idx, line in enumerate(data_lines, start=2):  # start=2 car ligne 1 = en-tête
            line = line.strip()
            if not line:  # Ignorer les lignes vides
                continue
                
            parts = [p.strip() for p in line.split(',')]
            
            if len(parts) < 1:
                errors.append(f"Ligne {idx}: Format invalide")
                continue
            
            email = parts[0] if len(parts) > 0 else ""
            first_name = parts[1] if len(parts) > 1 else ""
            last_name = parts[2] if len(parts) > 2 else ""
            student_id_str = parts[3] if len(parts) > 3 else ""
            
            # Validation de l'email
            if not email or '@' not in email:
                errors.append(f"Ligne {idx}: Email invalide '{email}'")
                continue
            
            # Vérifier si l'email existe déjà
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                errors.append(f"Ligne {idx}: Email {email} existe déjà")
                continue
            
            # Vérifier student_id si fourni
            student_id = None
            if student_id_str:
                try:
                    student_id = int(student_id_str)
                    existing_student = db.query(User).filter(User.student_id == student_id).first()
                    if existing_student:
                        errors.append(f"Ligne {idx}: N° étudiant {student_id} existe déjà")
                        continue
                except ValueError:
                    errors.append(f"Ligne {idx}: N° étudiant invalide '{student_id_str}'")
                    continue
            
            # Générer mot de passe aléatoire
            temporary_password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            # Créer full_name
            if first_name and last_name:
                full_name = f"{first_name} {last_name}"
            elif first_name:
                full_name = first_name
            elif last_name:
                full_name = last_name
            else:
                full_name = email.split('@')[0]
            
            # Créer l'étudiant
            try:
                new_student = User(
                    email=email,
                    password_hash=get_password_hash(temporary_password),
                    full_name=full_name,
                    first_name=first_name if first_name else None,
                    last_name=last_name if last_name else None,
                    student_id=student_id,
                    role="student",
                    is_active=True
                )
                
                db.add(new_student)
                db.flush()  # Pour obtenir l'ID sans commit
                
                created_students.append({
                    "id": new_student.id,
                    "email": email,
                    "full_name": full_name,
                    "first_name": first_name if first_name else None,
                    "last_name": last_name if last_name else None,
                    "student_id": student_id,
                    "temporary_password": temporary_password,
                    "created_at": datetime.utcnow().isoformat()
                })
            except Exception as e:
                errors.append(f"Ligne {idx}: Erreur création - {str(e)}")
                continue
        
        # Commit toutes les créations
        if created_students:
            db.commit()
        
        return {
            "success": True,
            "total_lines": len(data_lines),
            "created_count": len(created_students),
            "error_count": len(errors),
            "created_students": created_students,
            "errors": errors
        }
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erreur d'encodage du fichier. Utilisez UTF-8"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'import: {str(e)}"
        )


# ============ RESOURCES ENDPOINTS ============

@app.post("/resources", response_model=ResourceResponse, tags=["Resources"])
async def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle ressource"""
    try:
        # Vérifier que l'ID n'existe pas déjà
        existing = db.query(Resource).filter(Resource.resource_id == resource.resource_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Cette ressource existe déjà")
        
        # Convertir le dict et créer la ressource
        resource_data = resource.dict()
        
        # Convertir les tags si c'est une list
        if isinstance(resource_data.get('tags'), list):
            resource_data['tags'] = resource_data['tags']
        
        db_resource = Resource(**resource_data)
        db.add(db_resource)
        db.commit()
        db.refresh(db_resource)
        return db_resource
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur de validation: {str(e)}")

@app.get("/resources", tags=["Resources"])
async def get_all_resources(student_id: int = Query(None), db: Session = Depends(get_db)):
    """Récupérer toutes les ressources (avec statut de vue si student_id fourni)"""
    from models import ResourceView
    
    resources = db.query(Resource).all()
    
    # Si student_id est fourni, ajouter l'information is_viewed personnalisée
    if student_id:
        result = []
        for resource in resources:
            resource_dict = {
                "id": resource.id,
                "resource_id": resource.resource_id,
                "title": resource.title,
                "description": resource.description,
                "resource_type": resource.resource_type,
                "subject_id": resource.subject_id,
                "subject_name": resource.subject_name,
                "difficulty_level": resource.difficulty_level,
                "duration": resource.duration,
                "author": resource.author,
                "external_url": resource.external_url,
                "file_path": resource.file_path,
                "content": resource.content,
                "tags": resource.tags,
                "created_at": resource.created_at,
                "updated_at": resource.updated_at
            }
            
            # Vérifier si l'étudiant a vu cette ressource
            view = db.query(ResourceView).filter(
                ResourceView.resource_id == resource.resource_id,
                ResourceView.student_id == student_id
            ).first()
            
            resource_dict["is_viewed"] = view is not None
            result.append(resource_dict)
        
        return result
    else:
        # Mode ancien : retourner toutes les ressources sans personnalisation
        return resources

@app.get("/resources/{resource_id}/download", tags=["Resources"])
async def download_resource_file(resource_id: str, db: Session = Depends(get_db)):
    """Télécharger un fichier de ressource"""
    db_resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    
    if not db_resource.file_path:
        raise HTTPException(status_code=400, detail="Cette ressource n'a pas de fichier")
    
    file_path = db_resource.file_path
    
    # Handle local file paths (for Windows compatibility)
    if file_path.startswith('file://'):
        file_path = file_path.replace('file:///', '').replace('file://', '')
    
    # Convert forward slashes to backslashes for Windows paths
    # Check if it's a Windows path (has drive letter like C:/)
    if len(file_path) > 1 and file_path[1] == ':':
        file_path = file_path.replace('/', '\\')
    
    # Check if file exists
    path_obj = pathlib.Path(file_path)
    if not path_obj.exists():
        raise HTTPException(status_code=404, detail=f"Fichier non trouvé: {file_path}")
    
    # Return file for download
    return FileResponse(
        path=file_path,
        filename=db_resource.title or "download",
        media_type="application/octet-stream"
    )

@app.get("/resources/{resource_id}", response_model=ResourceResponse, tags=["Resources"])
async def get_resource(resource_id: str, db: Session = Depends(get_db)):
    """Récupérer une ressource par ID"""
    resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    return resource

@app.get("/resources/subject/{subject_id}", response_model=List[ResourceResponse], tags=["Resources"])
async def get_resources_by_subject(subject_id: str, db: Session = Depends(get_db)):
    """Récupérer les ressources par matière"""
    resources = db.query(Resource).filter(Resource.subject_id == subject_id).all()
    return resources

@app.put("/resources/{resource_id}", response_model=ResourceResponse, tags=["Resources"])
async def update_resource(resource_id: str, resource: ResourceUpdate, db: Session = Depends(get_db)):
    """Modifier une ressource"""
    db_resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    
    update_data = resource.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_resource, field, value)
    
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.delete("/resources/{resource_id}", tags=["Resources"])
async def delete_resource(resource_id: str, db: Session = Depends(get_db)):
    """Supprimer une ressource"""
    db_resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    
    db.delete(db_resource)
    db.commit()
    return {"detail": "Ressource supprimée"}

@app.put("/resources/{resource_id}/mark-viewed", response_model=ResourceResponse, tags=["Resources"])
async def mark_resource_viewed(
    resource_id: str, 
    is_viewed: str = Query("true"),
    student_id: int = Query(None),
    student_email: str = Query(None),
    db: Session = Depends(get_db)
):
    """Marquer une ressource comme consultée par un étudiant spécifique"""
    from models import ResourceView
    
    db_resource = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not db_resource:
        raise HTTPException(status_code=404, detail="Ressource non trouvée")
    
    # Si student_id est fourni, enregistrer dans resource_views
    if student_id:
        viewed = is_viewed.lower() in ["true", "1", "yes"]
        if viewed:
            # Vérifier si déjà enregistré
            existing_view = db.query(ResourceView).filter(
                ResourceView.resource_id == resource_id,
                ResourceView.student_id == student_id
            ).first()
            
            if not existing_view:
                # Créer un nouvel enregistrement
                new_view = ResourceView(
                    resource_id=resource_id,
                    student_id=student_id,
                    student_email=student_email
                )
                db.add(new_view)
                db.commit()
                print(f"✅ Ressource {resource_id} marquée comme vue par l'étudiant {student_id}")
        else:
            # Supprimer l'enregistrement si is_viewed=false
            db.query(ResourceView).filter(
                ResourceView.resource_id == resource_id,
                ResourceView.student_id == student_id
            ).delete()
            db.commit()
            print(f"❌ Vue supprimée pour ressource {resource_id} et étudiant {student_id}")
    
    db.refresh(db_resource)
    return db_resource

@app.post("/resources/upload", tags=["Resources"])
async def upload_resource_file(file: UploadFile = File(...)):
    """Upload un fichier de ressource"""
    try:
        # Créer le dossier uploads s'il n'existe pas
        upload_dir = "/app/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Générer un nom de fichier sécurisé avec timestamp
        import time
        file_extension = pathlib.Path(file.filename).suffix
        timestamp = int(time.time())
        safe_filename = f"resource_{timestamp}{file_extension}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as f:
            contents = await file.read()
            f.write(contents)
        
        return {
            "status": "success",
            "filename": safe_filename,
            "original_filename": file.filename,
            "file_path": f"/uploads/{safe_filename}",
            "message": "Fichier uploadé avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")

@app.get("/uploads/{filename}", tags=["Resources"])
async def download_uploaded_file(filename: str):
    """Télécharger un fichier uploadé"""
    try:
        file_path = f"/app/uploads/{filename}"
        path_obj = pathlib.Path(file_path)
        
        if not path_obj.exists():
            raise HTTPException(status_code=404, detail="Fichier non trouvé")
        
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# ============ QUIZ ENDPOINTS ============

@app.post("/quizzes", response_model=QuizResponse, tags=["Quizzes"])
async def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """Créer un nouveau quiz"""
    try:
        # Vérifier que la ressource existe
        resource = db.query(Resource).filter(Resource.resource_id == quiz.resource_id).first()
        if not resource:
            raise HTTPException(status_code=404, detail="Ressource non trouvée")
        
        # Vérifier que le quiz_id est unique
        existing_quiz = db.query(Quiz).filter(Quiz.quiz_id == quiz.quiz_id).first()
        if existing_quiz:
            raise HTTPException(status_code=400, detail="Ce quiz existe déjà")
        
        # Créer le quiz
        db_quiz = Quiz(
            quiz_id=quiz.quiz_id,
            resource_id=quiz.resource_id,
            title=quiz.title,
            description=quiz.description,
            total_questions=len(quiz.questions) if quiz.questions else 0,
            passing_score=quiz.passing_score,
            duration_minutes=quiz.duration_minutes,
            is_active=True
        )
        db.add(db_quiz)
        db.flush()
        
        # Créer les questions
        if quiz.questions:
            for q in quiz.questions:
                db_question = QuizQuestion(
                    quiz_id=quiz.quiz_id,
                    question_number=q.question_number,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options=q.options,
                    correct_answer=q.correct_answer,
                    points=q.points,
                    explanation=q.explanation
                )
                db.add(db_question)
        
        db.commit()
        db.refresh(db_quiz)
        return db_quiz
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur: {str(e)}")

@app.get("/quizzes/{quiz_id}", response_model=QuizResponse, tags=["Quizzes"])
async def get_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """Récupérer un quiz par ID"""
    db_quiz = db.query(Quiz).filter(Quiz.quiz_id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")
    return db_quiz

@app.get("/quizzes/resource/{resource_id}", response_model=List[QuizResponse], tags=["Quizzes"])
async def get_quizzes_by_resource(resource_id: str, db: Session = Depends(get_db)):
    """Récupérer tous les quiz d'une ressource"""
    quizzes = db.query(Quiz).filter(Quiz.resource_id == resource_id).all()
    return quizzes

@app.get("/quiz-questions/{quiz_id}", response_model=List[QuizQuestionResponse], tags=["Quizzes"])
async def get_quiz_questions(quiz_id: str, db: Session = Depends(get_db)):
    """Récupérer toutes les questions d'un quiz"""
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.question_number).all()
    return questions

@app.post("/quiz-responses", tags=["Quizzes"])
async def submit_quiz_responses(response: StudentQuizResponseCreate, db: Session = Depends(get_db)):
    """Soumettre les réponses d'un étudiant à un quiz"""
    try:
        # Vérifier que le quiz existe
        quiz = db.query(Quiz).filter(Quiz.quiz_id == response.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz non trouvé")
        
        # Récupérer toutes les questions
        questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == response.quiz_id).all()
        questions_dict = {q.id: q for q in questions}
        
        total_points = 0
        earned_points = 0
        
        # Traiter chaque réponse
        for resp in response.responses:
            question_id = resp.get("question_id")
            student_answer = resp.get("answer", "")
            
            question = questions_dict.get(question_id)
            if not question:
                continue
            
            # Vérifier si la réponse est correcte
            is_correct = question.correct_answer.lower().strip() == student_answer.lower().strip()
            points_earned = question.points if is_correct else 0
            
            # Enregistrer la réponse
            db_response = StudentQuizResponse(
                quiz_id=response.quiz_id,
                student_id=response.student_id,
                student_email=response.student_email,
                question_id=question_id,
                student_answer=student_answer,
                is_correct=is_correct,
                points_earned=points_earned
            )
            db.add(db_response)
            
            total_points += question.points
            earned_points += points_earned
        
        # Calculer le score en pourcentage
        score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0
        passed = score_percentage >= quiz.passing_score
        
        # Enregistrer le score final
        db_score = QuizScore(
            quiz_id=response.quiz_id,
            student_id=response.student_id,
            student_email=response.student_email,
            score=score_percentage,
            points=earned_points,
            max_points=total_points,
            passed=passed,
            attempt_number=1
        )
        db.add(db_score)
        
        db.commit()
        
        return {
            "status": "success",
            "quiz_id": response.quiz_id,
            "student_id": response.student_id,
            "score": score_percentage,
            "points": earned_points,
            "max_points": total_points,
            "passed": passed
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erreur: {str(e)}")

@app.get("/quiz-scores/{quiz_id}", response_model=List[QuizScoreResponse], tags=["Quizzes"])
async def get_quiz_scores(quiz_id: str, db: Session = Depends(get_db)):
    """Récupérer tous les scores d'un quiz (pour le prof)"""
    scores = db.query(QuizScore).filter(QuizScore.quiz_id == quiz_id).order_by(QuizScore.completed_at.desc()).all()
    return scores

@app.get("/student-quiz-scores/{student_id}", response_model=List[QuizScoreResponse], tags=["Quizzes"])
async def get_student_quiz_scores(student_id: int, db: Session = Depends(get_db)):
    """Récupérer tous les scores d'un étudiant"""
    scores = db.query(QuizScore).filter(QuizScore.student_id == student_id).order_by(QuizScore.completed_at.desc()).all()
    return scores

@app.get("/student-quiz-responses/{quiz_id}/{student_id}", tags=["Quizzes"])
async def get_student_quiz_responses(quiz_id: str, student_id: int, db: Session = Depends(get_db)):
    """Récupérer les réponses détaillées d'un étudiant à un quiz"""
    responses = db.query(StudentQuizResponse).filter(
        StudentQuizResponse.quiz_id == quiz_id,
        StudentQuizResponse.student_id == student_id
    ).all()
    
    result = []
    for r in responses:
        question = db.query(QuizQuestion).filter(QuizQuestion.id == r.question_id).first()
        result.append({
            "question_id": r.question_id,
            "question_text": question.question_text if question else "N/A",
            "student_answer": r.student_answer,
            "correct_answer": question.correct_answer if question else "N/A",
            "is_correct": r.is_correct,
            "points_earned": r.points_earned,
            "max_points": question.points if question else 0
        })
    
    return result

@app.delete("/quizzes/{quiz_id}", tags=["Quizzes"])
async def delete_quiz(quiz_id: str, db: Session = Depends(get_db)):
    """Supprimer un quiz"""
    db_quiz = db.query(Quiz).filter(Quiz.quiz_id == quiz_id).first()
    if not db_quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")
    
    # Supprimer aussi les questions associées
    db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).delete()
    db.delete(db_quiz)
    db.commit()
    return {"detail": "Quiz supprimé"}

# ============ MODULES ENDPOINTS ============

@app.get("/modules", response_model=List[ModuleResponse], tags=["Modules"])
async def get_modules(db: Session = Depends(get_db)):
    """Récupérer tous les modules"""
    modules = db.query(Module).all()
    return modules

@app.get("/modules/{module_id}", response_model=ModuleResponse, tags=["Modules"])
async def get_module(module_id: str, db: Session = Depends(get_db)):
    """Récupérer un module par ID"""
    module = db.query(Module).filter(Module.module_id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module non trouvé")
    return module

@app.post("/modules", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED, tags=["Modules"])
async def create_module(module: ModuleCreate, db: Session = Depends(get_db)):
    """Créer un nouveau module"""
    # Vérifier si le module existe déjà
    existing = db.query(Module).filter(Module.module_id == module.module_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Module ID déjà existant")
    
    db_module = Module(**module.dict())
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@app.put("/modules/{module_id}", response_model=ModuleResponse, tags=["Modules"])
async def update_module(module_id: str, module: ModuleUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un module"""
    db_module = db.query(Module).filter(Module.module_id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module non trouvé")
    
    for key, value in module.dict(exclude_unset=True).items():
        setattr(db_module, key, value)
    
    db.commit()
    db.refresh(db_module)
    return db_module

@app.delete("/modules/{module_id}", tags=["Modules"])
async def delete_module(module_id: str, db: Session = Depends(get_db)):
    """Supprimer un module"""
    db_module = db.query(Module).filter(Module.module_id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module non trouvé")
    
    # Supprimer aussi les subjects associés
    db.query(Subject).filter(Subject.module_id == module_id).delete()
    db.delete(db_module)
    db.commit()
    return {"detail": "Module supprimé"}

# ============ SUBJECTS ENDPOINTS ============

@app.get("/subjects", response_model=List[SubjectResponse], tags=["Subjects"])
async def get_subjects(module_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Récupérer toutes les matières ou filtrer par module"""
    query = db.query(Subject)
    if module_id:
        query = query.filter(Subject.module_id == module_id)
    subjects = query.all()
    return subjects

@app.get("/subjects/{subject_id}", response_model=SubjectResponse, tags=["Subjects"])
async def get_subject(subject_id: str, db: Session = Depends(get_db)):
    """Récupérer une matière par ID"""
    subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Matière non trouvée")
    return subject

@app.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED, tags=["Subjects"])
async def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle matière"""
    # Vérifier si le module existe
    module = db.query(Module).filter(Module.module_id == subject.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module non trouvé")
    
    # Vérifier si la matière existe déjà
    existing = db.query(Subject).filter(Subject.subject_id == subject.subject_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject ID déjà existant")
    
    db_subject = Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@app.put("/subjects/{subject_id}", response_model=SubjectResponse, tags=["Subjects"])
async def update_subject(subject_id: str, subject: SubjectUpdate, db: Session = Depends(get_db)):
    """Mettre à jour une matière"""
    db_subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Matière non trouvée")
    
    for key, value in subject.dict(exclude_unset=True).items():
        setattr(db_subject, key, value)
    
    db.commit()
    db.refresh(db_subject)
    return db_subject

@app.delete("/subjects/{subject_id}", tags=["Subjects"])
async def delete_subject(subject_id: str, db: Session = Depends(get_db)):
    """Supprimer une matière"""
    db_subject = db.query(Subject).filter(Subject.subject_id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Matière non trouvée")
    
    db.delete(db_subject)
    db.commit()
    return {"detail": "Matière supprimée"}


# ============ TEACHER RECOMMENDATIONS ENDPOINTS ============
# Storage temporaire pour les recommandations et certifications
# En production, cela devrait être dans une vraie table de base de données
_recommendations_storage = []
_certifications_storage = []

@app.post("/teacher/recommendations", tags=["Teacher"])
async def save_recommendations(request: Request):
    """Sauvegarder les recommandations du professeur"""
    global _recommendations_storage
    try:
        data = await request.json()
        _recommendations_storage = data if isinstance(data, list) else [data]
        print(f"📥 Recommandations sauvegardées: {len(_recommendations_storage)}")
        return {"message": f"{len(_recommendations_storage)} recommandations sauvegardées"}
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/teacher/recommendations", tags=["Teacher"])
async def get_recommendations():
    """Récupérer les recommandations du professeur"""
    print(f"📤 Envoi de {len(_recommendations_storage)} recommandations")
    return _recommendations_storage

@app.post("/teacher/certifications", tags=["Teacher"])
async def save_certifications(request: Request):
    """Sauvegarder les certifications du professeur"""
    global _certifications_storage
    try:
        data = await request.json()
        _certifications_storage = data if isinstance(data, list) else [data]
        print(f"📥 Certifications sauvegardées: {len(_certifications_storage)}")
        return {"message": f"{len(_certifications_storage)} certifications sauvegardées"}
    except Exception as e:
        print(f"❌ Erreur: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/teacher/certifications", tags=["Teacher"])
async def get_certifications():
    """Récupérer les certifications du professeur"""
    print(f"📤 Envoi de {len(_certifications_storage)} certifications")
    return _certifications_storage


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)

