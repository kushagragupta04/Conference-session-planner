pipeline {
agent any

```
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
                echo "Backend dependencies installed successfully."
            }
        }
    }

    stage('Frontend: Audit & Build') {
        steps {
            dir('frontend') {
                bat 'npm install'
                bat 'npm run build'
                bat 'npm audit'
                echo "Frontend dependencies installed and built."
            }
        }
    }

    stage('Docker: Build Images') {
        steps {
            script {
                bat "docker build -t ${DOCKER_IMAGE_BACKEND}:${VERSION} ./backend"
                bat "docker build -t ${DOCKER_IMAGE_FRONTEND}:${VERSION} ./frontend"
            }
        }
    }

    stage('Infra: Validate Compose') {
        steps {
            bat 'docker compose config'
            echo "Docker Compose file validated."
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
        echo "Cleaning up workspace..."
        cleanWs()
    }
    success {
        echo "Pipeline executed successfully!"
    }
    failure {
        echo "Pipeline failed. Please check logs."
    }
}
```

}
