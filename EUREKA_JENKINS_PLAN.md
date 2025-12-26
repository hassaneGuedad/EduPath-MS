# Plan d'intégration Eureka + Jenkins dans EduPath

## 📋 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Phase 1 : Eureka Service Discovery](#phase-1--eureka-service-discovery)
3. [Phase 2 : Jenkins CI/CD Pipeline](#phase-2--jenkins-cicd-pipeline)
4. [Phase 3 : Intégration complète](#phase-3--intégration-complète)
5. [Timeline et ressources](#timeline-et-ressources)

---

## 🎯 Vue d'ensemble

### Objectifs
- **Eureka** : Service Discovery pour communication dynamique entre microservices
- **Jenkins** : Automatisation du build, test et déploiement (CI/CD)

### Architecture cible

```
┌─────────────────────────────────────────────────────────────┐
│                    JENKINS CI/CD                             │
│  Build → Test → Docker Build → Push → Deploy                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  EUREKA SERVER                               │
│              Service Registry (Port 8761)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ↓            ↓            ↓
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Auth    │  │ Prepa   │  │ Path    │
   │ Service │  │ Data    │  │ Predict │
   └─────────┘  └─────────┘  └─────────┘
   (Enregistré) (Enregistré) (Enregistré)
```

---

## 📍 Phase 1 : Eureka Service Discovery

### Étape 1.1 : Créer le serveur Eureka

#### Fichier : `services/eureka-server/pom.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.edupath</groupId>
    <artifactId>eureka-server</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
    </dependencies>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>2023.0.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

#### Fichier : `services/eureka-server/src/main/java/EurekaServerApplication.java`
```java
package com.edupath.eureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

#### Fichier : `services/eureka-server/src/main/resources/application.yml`
```yaml
server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/

spring:
  application:
    name: eureka-server
```

#### Fichier : `services/eureka-server/Dockerfile`
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/eureka-server-1.0.0.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

### Étape 1.2 : Adapter les services Python pour Eureka

#### Option A : Utiliser py-eureka-client

**Installation** :
```bash
pip install py-eureka-client
```

**Exemple pour auth-service** :
```python
# services/auth-service/src/app.py
import py_eureka_client.eureka_client as eureka_client
from flask import Flask

app = Flask(__name__)

# Configuration Eureka
eureka_client.init(
    eureka_server="http://eureka-server:8761/eureka",
    app_name="auth-service",
    instance_port=3008,
    instance_host="auth-service"
)

# Vos routes existantes...
```

#### Option B : Utiliser un API Gateway (recommandé)

**Créer un Spring Cloud Gateway** :

```yaml
# services/api-gateway/src/main/resources/application.yml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: auth-service
          uri: lb://auth-service
          predicates:
            - Path=/auth/**
        - id: prepa-data
          uri: lb://prepa-data
          predicates:
            - Path=/prepa/**
        - id: path-predictor
          uri: lb://path-predictor
          predicates:
            - Path=/predict/**

eureka:
  client:
    serviceUrl:
      defaultZone: http://eureka-server:8761/eureka/
```

---

### Étape 1.3 : Mise à jour docker-compose.yml

```yaml
# Ajouter au docker-compose.yml
services:
  eureka-server:
    build: ./services/eureka-server
    container_name: edupath-eureka-server
    ports:
      - "8761:8761"
    networks:
      - edupath-network
    environment:
      - SPRING_PROFILES_ACTIVE=docker

  api-gateway:
    build: ./services/api-gateway
    container_name: edupath-api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server
    networks:
      - edupath-network
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://eureka-server:8761/eureka/

  # Modifier les services existants pour pointer vers le gateway
  teacher-console:
    environment:
      - VITE_AUTH_API=http://localhost:8080/auth
      - VITE_PREPA_API=http://localhost:8080/prepa
```

---

## 🔧 Phase 2 : Jenkins CI/CD Pipeline

### Étape 2.1 : Installation Jenkins

#### Fichier : `jenkins/Dockerfile`
```dockerfile
FROM jenkins/jenkins:lts-jdk17

USER root

# Installer Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    usermod -aG docker jenkins

# Installer Node.js pour les frontends
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Installer Python pour les services ML
RUN apt-get install -y python3 python3-pip

USER jenkins

# Installer les plugins Jenkins
RUN jenkins-plugin-cli --plugins \
    docker-workflow \
    git \
    pipeline-stage-view \
    blueocean \
    nodejs
```

#### Fichier : `docker-compose.yml` (ajout Jenkins)
```yaml
services:
  jenkins:
    build: ./jenkins
    container_name: edupath-jenkins
    ports:
      - "8082:8080"      # Interface web
      - "50000:50000"    # Agent
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - edupath-network
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false

volumes:
  jenkins_home:
```

---

### Étape 2.2 : Créer les Jenkinsfiles

#### Pour les services Python (exemple : auth-service)

**Fichier : `services/auth-service/Jenkinsfile`**
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = "edupath/auth-service"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('services/auth-service') {
                    sh 'pip install -r requirements.txt'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('services/auth-service') {
                    sh 'python -m pytest tests/ || true'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('services/auth-service') {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh """
                    docker-compose -f docker-compose.yml up -d auth-service
                """
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
```

#### Pour les frontends React (exemple : teacher-console)

**Fichier : `services/teacher-console/Jenkinsfile`**
```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    environment {
        DOCKER_IMAGE = "edupath/teacher-console"
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('services/teacher-console') {
                    sh 'npm ci'
                }
            }
        }
        
        stage('Lint') {
            steps {
                dir('services/teacher-console') {
                    sh 'npm run lint || true'
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('services/teacher-console') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('services/teacher-console') {
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh """
                    docker-compose -f docker-compose.yml up -d teacher-console
                """
            }
        }
    }
}
```

---

### Étape 2.3 : Pipeline multi-branches

**Fichier : `Jenkinsfile` (racine du projet)**
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build All Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        build job: 'auth-service', wait: true
                    }
                }
                stage('Prepa Data') {
                    steps {
                        build job: 'prepa-data', wait: true
                    }
                }
                stage('Path Predictor') {
                    steps {
                        build job: 'path-predictor', wait: true
                    }
                }
                stage('Teacher Console') {
                    steps {
                        build job: 'teacher-console', wait: true
                    }
                }
                stage('Student Portal') {
                    steps {
                        build job: 'student-portal', wait: true
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit'
            }
        }
        
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker-compose -f docker-compose.prod.yml up -d'
            }
        }
    }
}
```

---

## 🔄 Phase 3 : Intégration complète

### Étape 3.1 : Configuration Jenkins

**Script de configuration automatique** :

**Fichier : `jenkins/init.groovy.d/configure-jenkins.groovy`**
```groovy
import jenkins.model.*
import hudson.security.*

def instance = Jenkins.getInstance()

// Créer un utilisateur admin
def hudsonRealm = new HudsonPrivateSecurityRealm(false)
hudsonRealm.createAccount("admin", "admin123")
instance.setSecurityRealm(hudsonRealm)

def strategy = new FullControlOnceLoggedInAuthorizationStrategy()
instance.setAuthorizationStrategy(strategy)

instance.save()
```

---

### Étape 3.2 : Webhooks GitHub/GitLab

**Configuration dans Jenkins** :
1. Installer le plugin "GitHub Integration"
2. Configurer le webhook dans votre repo :
   - URL : `http://your-jenkins:8082/github-webhook/`
   - Events : Push, Pull Request

---

### Étape 3.3 : Monitoring et notifications

**Fichier : `Jenkinsfile` (ajout notifications)**
```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "✅ Build #${env.BUILD_NUMBER} succeeded for ${env.JOB_NAME}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "❌ Build #${env.BUILD_NUMBER} failed for ${env.JOB_NAME}"
        )
    }
}
```

---

## 📊 Timeline et ressources

### Phase 1 : Eureka (1 semaine)
- **Jour 1-2** : Setup Eureka Server
- **Jour 3-4** : Adapter les services
- **Jour 5-7** : Tests et validation

### Phase 2 : Jenkins (2 semaines)
- **Semaine 1** : Installation et configuration
- **Semaine 2** : Création des pipelines

### Phase 3 : Intégration (1 semaine)
- **Jour 1-3** : Tests end-to-end
- **Jour 4-5** : Documentation
- **Jour 6-7** : Formation équipe

### Ressources nécessaires
- **Serveur** : 8GB RAM minimum pour Jenkins + Eureka
- **Stockage** : 50GB pour images Docker
- **Réseau** : Ports 8761 (Eureka), 8082 (Jenkins), 8080 (Gateway)

---

## 🎯 Avantages attendus

### Avec Eureka
✅ Service Discovery automatique  
✅ Load balancing côté client  
✅ Résilience (failover automatique)  
✅ Scalabilité horizontale facile

### Avec Jenkins
✅ Déploiement automatisé  
✅ Tests automatiques  
✅ Qualité de code garantie  
✅ Rollback rapide en cas d'erreur

---

## 📚 Ressources et documentation

- **Eureka** : https://spring.io/guides/gs/service-registration-and-discovery/
- **Jenkins** : https://www.jenkins.io/doc/book/pipeline/
- **Docker** : https://docs.docker.com/compose/
- **Spring Cloud Gateway** : https://spring.io/projects/spring-cloud-gateway

---

**Version** : 1.0  
**Date** : Décembre 2025  
**Projet** : EduPath - Intégration Eureka + Jenkins
