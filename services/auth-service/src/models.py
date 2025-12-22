from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ARRAY, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    first_name = Column(String, nullable=True)  # Prénom
    last_name = Column(String, nullable=True)   # Nom de famille
    student_id = Column(Integer, nullable=True, unique=True)  # ID étudiant pour lier avec autres services
    role = Column(String, default="student")  # admin, teacher, student
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(String, nullable=False)  # pdf, video, link, etc
    subject_id = Column(String, nullable=True)
    subject_name = Column(String, nullable=True)
    difficulty_level = Column(String, nullable=True)  # Beginner, Intermediate, Advanced
    duration = Column(Integer, nullable=True)  # in minutes
    author = Column(String, nullable=True)
    external_url = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    content = Column(Text, nullable=True)  # Contenu détaillé du cours
    tags = Column(ARRAY(String), nullable=True, default=[])
    is_viewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String, unique=True, index=True, nullable=False)
    resource_id = Column(String, ForeignKey("resources.resource_id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    total_questions = Column(Integer, default=0)
    passing_score = Column(Float, default=50.0)  # Score en pourcentage pour passer
    duration_minutes = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String, ForeignKey("quizzes.quiz_id"), nullable=False)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="multiple_choice")  # multiple_choice, true_false, short_answer
    options = Column(ARRAY(String), nullable=True)  # JSON array of options
    correct_answer = Column(String, nullable=False)  # The correct answer
    points = Column(Float, default=1.0)  # Points for this question
    explanation = Column(Text, nullable=True)  # Explanation after answer
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class StudentQuizResponse(Base):
    __tablename__ = "student_quiz_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String, ForeignKey("quizzes.quiz_id"), nullable=False)
    student_id = Column(Integer, nullable=False)  # Student ID from User.student_id
    student_email = Column(String, nullable=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False)
    student_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    points_earned = Column(Float, default=0.0)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())


class QuizScore(Base):
    __tablename__ = "quiz_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(String, ForeignKey("quizzes.quiz_id"), nullable=False)
    student_id = Column(Integer, nullable=False)
    student_email = Column(String, nullable=True)
    score = Column(Float, nullable=False)  # Pourcentage
    points = Column(Float, default=0.0)  # Points totaux
    max_points = Column(Float, default=0.0)  # Points maximum
    passed = Column(Boolean, default=False)
    attempt_number = Column(Integer, default=1)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Module(Base):
    __tablename__ = "modules"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(String, unique=True, index=True, nullable=False)
    module_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    credits = Column(Integer, default=0)
    difficulty_level = Column(String, default="Intermediate")  # Beginner, Intermediate, Advanced
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(String, unique=True, index=True, nullable=False)
    module_id = Column(String, ForeignKey("modules.module_id"), nullable=False)
    subject_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    hours = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ResourceView(Base):
    """Table pour suivre quelles ressources ont été vues par quel étudiant"""
    __tablename__ = "resource_views"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String, ForeignKey("resources.resource_id"), nullable=False)
    student_id = Column(Integer, nullable=False)  # ID de l'étudiant
    student_email = Column(String, nullable=True)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

