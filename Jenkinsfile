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
                bat 'npm install'
                bat 'npm audit'
            }
        }
    }

    stage('Frontend: Audit & Build') {
        steps {
            dir('frontend') {
                bat 'npm install'
                bat 'npm run build'
                bat 'npm audit'
            }
        }
    }

    stage('Docker: Build Images') {
        steps {
            bat "docker build -t ${DOCKER_IMAGE_BACKEND}:${VERSION} ./backend"
            bat "docker build -t ${DOCKER_IMAGE_FRONTEND}:${VERSION} ./frontend"
        }
    }

    stage('Infra: Validate Compose') {
        steps {
            bat 'docker compose config'
        }
    }

    stage('Deploy') {
        steps {
            bat 'docker compose down'
            bat 'docker compose up -d --build'
        }
    }
}

post {
    always {
        cleanWs()
    }
}
}
