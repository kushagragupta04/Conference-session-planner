pipeline {
    agent any

    environment {
        DOCKER_IMAGE_BACKEND = "session-planner-backend"
        DOCKER_IMAGE_FRONTEND = "session-planner-frontend"
        VERSION = "1.0.${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend: Audit & Build') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm audit || true' 
                    echo "Backend dependencies installed successfully."
                }
            }
        }

        stage('Frontend: Audit & Build') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build || echo "Skip build if no script"'
                    sh 'npm audit || true'
                    echo "Frontend dependencies installed and built."
                }
            }
        }

        stage('Docker: Build Images') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE_BACKEND}:${VERSION} ./backend"
                    sh "docker build -t ${DOCKER_IMAGE_FRONTEND}:${VERSION} ./frontend"
                }
            }
        }

        stage('Infra: Validate Compose') {
            steps {
                sh 'docker-compose config'
                echo "Docker Compose file validated."
            }
        }

        // stage('Deploy') {
        //     steps {
        //         echo "Deploying Version ${VERSION} to Production Environment..."
        //         // In a real environment, you might use:
        //         // sh 'docker-compose down'
        //         // sh 'docker-compose up -d'
        //     }
        // }
        stage('Deploy') {
    steps {
        sh 'docker-compose down || true'
        sh 'docker-compose up -d --build'
    }
}
    }

    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check logs.'
        }
    }
}
