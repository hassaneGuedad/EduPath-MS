pipeline {
    agent any
    environment {
        DOCKER_COMPOSE = 'docker-compose'
        NGROK_AUTH = credentials('ngrok-auth-token') // À configurer dans Jenkins Credentials
        GIT_REPO = 'https://github.com/hassaneGuedad/EduPath-MS.git' // À adapter si besoin
    }
    stages {
        stage('Checkout') {
            steps {
                git url: env.GIT_REPO
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Run Tests') {
            steps {
                // Exemple: lancer les tests unitaires Python
                sh 'docker-compose run --rm prepa-data pytest || true'
                // Ajouter d'autres tests selon vos services
            }
        }
        stage('Deploy Services') {
            steps {
                sh 'docker-compose up -d'
            }
        }
        stage('Expose with ngrok') {
            steps {
                sh 'curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null'
                sh 'echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list'
                sh 'sudo apt update && sudo apt install -y ngrok'
                sh 'ngrok config add-authtoken $NGROK_AUTH'
                sh 'ngrok http 3006 --log=stdout &'
                // Adapter le port selon le service à exposer (ex: 3006 pour TeacherConsole)
            }
        }
    }
    post {
        always {
            sh 'docker-compose down || true'
        }
    }
}
