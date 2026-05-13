pipeline {
    agent any
    environment {
        IMAGE_NAME = "my-studyplanner-app"
        IMAGE_TAG = "latest"
        CONTAINER_NAME = "studyplanner-container"
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/priyanshudotgit/studyPlanner-PEP.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }
        stage('Deploy Container') {
            steps {
                sh "docker rm -f ${CONTAINER_NAME} || true"
                sh "docker run -d --name ${CONTAINER_NAME} -p 3000:80 ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }
        stage('Health Check') {
            steps {
                script {
                    echo "Checking if the app is reachable..."
                    sleep 5
                    sh "curl -f [http://172.17.0.1:3000](http://172.17.0.1:3000) || exit 1"
                }
            }
        }
    }
}