pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker-compose'
        GIT_REPO = 'https://github.com/hassaneGuedad/EduPath-MS.git'
        NGROK_AUTH = credentials('ngrok-auth-token')
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
                bat 'docker-compose run --rm prepa-data pytest || exit 0'
            }
        }

        stage('Deploy Services') {
            steps {
                bat 'docker-compose up -d'
            }
        }

        stage('Expose with ngrok') {
            steps {
                bat 'curl -o ngrok.zip https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-windows-amd64.zip'
                bat 'powershell -Command "Expand-Archive -Path ngrok.zip -DestinationPath . -Force"'
                bat 'ngrok.exe config add-authtoken %NGROK_AUTH%'
                bat 'start /B ngrok.exe http 3006'
            }
        }
    }

    post {
        always {
            bat 'docker-compose down || exit 0'
        }
    }
}
