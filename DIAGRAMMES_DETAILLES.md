# 📊 Diagrammes Détaillés - EduPath-MS

## 1. Diagramme de Séquence - Flux Complet

```mermaid
sequenceDiagram
    participant LMS as LMS (Moodle/Canvas)
    participant LC as LMSConnector
    participant PD as PrepaData
    participant SP as StudentProfiler
    participant PP as PathPredictor
    participant RB as RecoBuilder
    participant TC as TeacherConsole
    participant ST as StudentPortal
    participant DB as PostgreSQL

    Note over LMS,DB: Phase 1: Synchronisation
    LMS->>LC: OAuth2 Authentication
    LC->>LMS: Request Student Data
    LMS-->>LC: Raw Data (scores, participation)
    LC->>DB: Save to edupath_lms
    
    Note over LC,DB: Phase 2: Préparation
    PD->>DB: Read raw data
    PD->>PD: Calculate features
    PD->>DB: Save features to edupath_prepa
    
    Note over PD,DB: Phase 3: Profilage
    SP->>DB: Read features
    SP->>SP: PCA + KMeans
    SP->>DB: Save profiles to edupath_profiler
    
    Note over SP,DB: Phase 4: Prédiction
    PP->>DB: Read features
    PP->>PP: XGBoost Prediction
    PP->>MLflow: Log metrics
    PP->>DB: Save predictions to edupath_predictor
    
    Note over PP,DB: Phase 5: Recommandations
    RB->>SP: GET /profile/{student_id}
    RB->>PP: POST /predict
    RB->>RB: BERT + Faiss Search
    RB->>MinIO: Get resource URLs
    RB->>DB: Save recommendations
    
    Note over RB,ST: Phase 6: Visualisation
    TC->>RB: GET /recommend/{student_id}
    RB-->>TC: Recommendations
    TC->>TC: Display Dashboard
    
    ST->>RB: GET /recommend/{student_id}
    RB-->>ST: Recommendations
    ST->>ST: Display Student View
```

## 2. Diagramme d'État - Cycle de Vie d'un Étudiant

```mermaid
stateDiagram-v2
    [*] --> NonSynchronise: Nouvel étudiant
    NonSynchronise --> DonneesBrutes: Synchronisation LMS
    DonneesBrutes --> FeaturesCalculees: PrepaData
    FeaturesCalculees --> ProfilAttribue: StudentProfiler
    ProfilAttribue --> PredictionGeneree: PathPredictor
    PredictionGeneree --> RecommandationsGenerees: RecoBuilder
    RecommandationsGenerees --> SuiviActif: Enseignant/Étudiant
    
    SuiviActif --> DonneesBrutes: Nouvelle synchronisation
    SuiviActif --> RisqueEleve: Détection risque
    RisqueEleve --> ActionsCorrectives: Intervention
    ActionsCorrectives --> SuiviActif: Retour normal
    
    SuiviActif --> [*]: Fin de parcours
```

## 3. Diagramme de Composants - Architecture Technique

```mermaid
graph TB
    subgraph "Frontend Layer"
        TC[TeacherConsole<br/>React Components]
        SP[StudentPortal<br/>React Components]
        SC[StudentCoach<br/>Flutter Widgets]
    end
    
    subgraph "API Gateway"
        Auth[AuthService<br/>FastAPI Router]
    end
    
    subgraph "Business Logic Layer"
        LC[LMSConnector<br/>Express Routes]
        PD[PrepaData<br/>Flask Blueprints]
        SP_Service[StudentProfiler<br/>Flask Routes]
        PP[PathPredictor<br/>Flask Routes]
        RB[RecoBuilder<br/>Flask Routes]
    end
    
    subgraph "Data Access Layer"
        DB_LC[LMS Database<br/>Module]
        DB_PD[Prepa Database<br/>Module]
        DB_SP[Profiler Database<br/>Module]
        DB_PP[Predictor Database<br/>Module]
        DB_RB[Reco Database<br/>Module]
    end
    
    subgraph "External Services"
        MLflow[MLflow<br/>Tracking]
        MinIO[MinIO<br/>Storage]
        Airflow[Airflow<br/>Scheduler]
    end
    
    TC --> Auth
    SP --> Auth
    SC --> Auth
    Auth --> LC
    Auth --> PD
    Auth --> SP_Service
    Auth --> PP
    Auth --> RB
    
    LC --> DB_LC
    PD --> DB_PD
    SP_Service --> DB_SP
    PP --> DB_PP
    RB --> DB_RB
    
    PP -.-> MLflow
    RB -.-> MinIO
    PD -.-> Airflow
```

## 4. Diagramme d'Activité - Processus de Recommandation

```mermaid
flowchart TD
    Start([Début: Étudiant demande recommandations]) --> GetProfile[Récupérer profil étudiant]
    GetProfile --> CheckProfile{Profil existe?}
    CheckProfile -->|Non| CalculateProfile[Calculer profil]
    CheckProfile -->|Oui| GetPredictions[Récupérer prédictions]
    CalculateProfile --> GetPredictions
    GetPredictions --> DetectDifficulties[Détecter difficultés]
    DetectDifficulties --> GenerateEmbeddings[Générer embeddings BERT]
    GenerateEmbeddings --> SearchFaiss[Recherche Faiss]
    SearchFaiss --> RankResources[Ranger ressources par score]
    RankResources --> FilterTopK[Filtrer Top-K]
    FilterTopK --> GetMinIOUrls[Générer URLs MinIO]
    GetMinIOUrls --> SaveRecommendations[Sauvegarder recommandations]
    SaveRecommendations --> ReturnResults([Retourner résultats])
    
    style Start fill:#90EE90
    style ReturnResults fill:#90EE90
    style DetectDifficulties fill:#FFD700
    style SearchFaiss fill:#87CEEB
```

## 5. Diagramme ER - Modèle de Données

```mermaid
erDiagram
    USER ||--o{ SYNC_LOG : creates
    USER ||--o{ STUDENT_PROFILE : has
    USER ||--o{ PREDICTION : generates
    USER ||--o{ RECOMMENDATION : receives
    
    SYNC_LOG ||--o{ RAW_STUDENT_DATA : contains
    RAW_STUDENT_DATA ||--|| STUDENT_FEATURES : processed_to
    STUDENT_FEATURES ||--|| STUDENT_PROFILE : used_for
    STUDENT_FEATURES ||--o{ PREDICTION : used_in
    STUDENT_PROFILE ||--o{ RECOMMENDATION : influences
    PREDICTION ||--o{ RECOMMENDATION : triggers
    
    RESOURCE ||--o{ RECOMMENDATION : recommended_in
    RESOURCE }o--|| MINIO_FILE : stored_in
    
    USER {
        int id PK
        string email
        string password_hash
        string role
        timestamp created_at
    }
    
    SYNC_LOG {
        int id PK
        int user_id FK
        timestamp timestamp
        string status
        int records_count
    }
    
    RAW_STUDENT_DATA {
        int id PK
        int sync_log_id FK
        string student_id
        string module_id
        decimal score
        int participation
        int time_spent
    }
    
    STUDENT_FEATURES {
        int id PK
        string student_id
        decimal engagement_rate
        decimal average_score
        decimal access_frequency
        int completion_delay
        decimal success_rate
    }
    
    STUDENT_PROFILE {
        int id PK
        string student_id
        string profile_type
        int cluster_id
        decimal confidence
        jsonb characteristics
    }
    
    PREDICTION {
        int id PK
        string student_id
        string module_id
        decimal risk_score
        decimal confidence
        string model_version
    }
    
    RESOURCE {
        int id PK
        string title
        text description
        string type
        string minio_path
        vector embedding
    }
    
    RECOMMENDATION {
        int id PK
        string student_id
        int resource_id FK
        decimal score
        timestamp created_at
    }
```

## 6. Diagramme de Déploiement

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Network: edupath-network"
            subgraph "Frontend Containers"
                TC_C[teacher-console:3006]
                SP_C[student-portal:3009]
            end
            
            subgraph "Backend Containers"
                LC_C[lms-connector:3001]
                PD_C[prepa-data:3002]
                SP_SVC[student-profiler:3003]
                PP_C[path-predictor:3004]
                RB_C[reco-builder:3005]
                AUTH_C[auth-service:3008]
                BENCH_C[benchmarks-service:3010]
            end
            
            subgraph "Infrastructure Containers"
                PG_C[postgres:5432]
                MINIO_C[minio:9000/9001]
                MLFLOW_C[mlflow:5000]
                AIRFLOW_WS[airflow-webserver:8080]
                AIRFLOW_SCH[airflow-scheduler]
            end
        end
    end
    
    TC_C --> AUTH_C
    SP_C --> AUTH_C
    AUTH_C --> PG_C
    LC_C --> PG_C
    PD_C --> PG_C
    SP_SVC --> PG_C
    PP_C --> PG_C
    RB_C --> PG_C
    RB_C --> MINIO_C
    PP_C --> MLFLOW_C
    PD_C --> AIRFLOW_WS
```

## 7. Diagramme de Cas d'Utilisation Global

```mermaid
graph LR
    subgraph "Acteurs"
        Admin[Administrateur]
        Teacher[Enseignant]
        Student[Étudiant]
        System[Système]
    end
    
    subgraph "Cas d'Utilisation"
        UC1[Synchroniser données LMS]
        UC2[Calculer features]
        UC3[Générer profils]
        UC4[Prédire risques]
        UC5[Générer recommandations]
        UC6[Visualiser dashboard]
        UC7[Consulter recommandations]
        UC8[Gérer utilisateurs]
        UC9[Exporter benchmarks]
    end
    
    Admin --> UC1
    Admin --> UC8
    System --> UC2
    System --> UC3
    System --> UC4
    System --> UC5
    Teacher --> UC6
    Teacher --> UC9
    Student --> UC7
```

## 8. Diagramme de Communication Inter-Services

```mermaid
graph TB
    subgraph "Synchronous HTTP"
        LC_HTTP[LMSConnector<br/>HTTP REST]
        PD_HTTP[PrepaData<br/>HTTP REST]
        SP_HTTP[StudentProfiler<br/>HTTP REST]
        PP_HTTP[PathPredictor<br/>HTTP REST]
        RB_HTTP[RecoBuilder<br/>HTTP REST]
    end
    
    subgraph "Asynchronous DB"
        DB[(PostgreSQL<br/>Shared Database)]
    end
    
    subgraph "Orchestration"
        AF[Airflow<br/>DAGs]
    end
    
    subgraph "Tracking"
        ML[MLflow<br/>Tracking API]
    end
    
    subgraph "Storage"
        MINIO[MinIO<br/>S3 API]
    end
    
    LC_HTTP -->|Write| DB
    PD_HTTP -->|Read/Write| DB
    SP_HTTP -->|Read/Write| DB
    PP_HTTP -->|Read/Write| DB
    RB_HTTP -->|Read/Write| DB
    
    PD_HTTP -->|Orchestrate| AF
    PP_HTTP -->|Track| ML
    RB_HTTP -->|Store| MINIO
    
    SP_HTTP -->|GET /profile| RB_HTTP
    PP_HTTP -->|POST /predict| RB_HTTP
```

---

## Légende des Diagrammes

- **Diagramme de Séquence** : Interactions temporelles entre services
- **Diagramme d'État** : États et transitions d'un étudiant
- **Diagramme de Composants** : Architecture technique détaillée
- **Diagramme d'Activité** : Flux de traitement des recommandations
- **Diagramme ER** : Modèle de données relationnel
- **Diagramme de Déploiement** : Architecture Docker
- **Diagramme de Cas d'Utilisation** : Fonctionnalités par acteur
- **Diagramme de Communication** : Types de communication inter-services

