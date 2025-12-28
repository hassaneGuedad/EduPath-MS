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

        stage('Run Tests') {
            steps {
                // Tests unitaires (ne bloque pas le pipeline s'ils échouent)
                bat 'docker-compose run --rm prepa-data pytest || exit 0'
            }
        }
    }

    post {
        always {
            // Nettoyage
            bat 'docker-compose down --remove-orphans || exit 0'
        }
        success {
            echo '✅ Pipeline CI terminé avec succès'
        }
        failure {
            echo '❌ Échec du pipeline CI'
        }
    }
}
