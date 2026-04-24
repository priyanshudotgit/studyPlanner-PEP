pipeline {
    agent any
    environment {
        IMAGE_NAME = "my-studyplanner-app"
        IMAGE_TAG = "latest"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/priyanshudotgit/studyPlanner-PEP.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
            }
        }
        stage('Run Container') {
            steps {
                sh 'docker rm -f my-nginx-container || true'
                sh 'docker run -d --name my-nginx-container -p 3000:80 ${IMAGE_NAME}:${IMAGE_TAG}'
            }
        }
    }
}
