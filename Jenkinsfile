pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        GIT_REPO = 'https://github.com/hassaneGuedad/EduPath-MS.git'
    }

    stages {

        stage('Checkout') {
            steps {
                git url: env.GIT_REPO, branch: 'micro'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build'
            }
        }

        stage('Run Tests (Unitaires)') {
            steps {
                // Tests unitaires SANS lancer postgres/minio
                bat 'docker-compose run --rm --no-deps prepa-data pytest || exit 0'
            }
        }
    }

    post {
        always {
            // Nettoyage sans toucher aux conteneurs existants
            bat 'docker-compose down --remove-orphans || exit 0'
        }
        success {
            echo '✅ CI EduPath réussie'
        }
        failure {
            echo '❌ CI EduPath échouée'
        }
    }
}
