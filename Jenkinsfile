pipeline {
    agent any

    stages {
        stage('Checkout SCM') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/hassaneGuedad/EduPath-MS.git']]
                ])
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker-compose build --parallel'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    try {
                        bat 'docker-compose run --rm prepa-data pytest'
                    } catch (err) {
                        echo "Tests failed but pipeline will continue: ${err}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        stage('Deploy Services') {
            steps {
                bat 'docker-compose up -d'
            }
        }

        stage('Post Deployment') {
            steps {
                echo 'All services deployed successfully.'
            }
        }
    }

    post {
        always {
            node {
                echo 'Cleaning up unused containers and images...'
                bat 'docker system prune -f'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        unstable {
            echo 'Pipeline completed with warnings (tests failed).'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
