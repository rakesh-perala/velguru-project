
pipeline {
    agent any

    tools {
        jdk 'Java17'
        maven 'Maven-3.8.7'
    }

    environment {
        AWS_REGION = 'ap-south-2'
        AWS_ACCOUNT_ID = '652310866649'
        ECR_REPOSITORY = 'velguru-backend'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME = "${ECR_REGISTRY}/${ECR_REPOSITORY}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.GIT_SHORT_COMMIT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()
                }

                echo "Git Commit: ${env.GIT_SHORT_COMMIT}"
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Unit Test') {
            steps {
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    env.IMAGE_TAG = "build-${env.BUILD_NUMBER}-${env.GIT_SHORT_COMMIT}"
                }

                sh """
                    docker build \
                      -f docker/backend/Dockerfile \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      backend
                """

                echo "Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('ECR Login') {
            steps {
                sh """
                    aws ecr get-login-password \
                      --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin \
                      ${ECR_REGISTRY}
                """
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh """
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Verify Image') {
            steps {
                sh """
                    aws ecr describe-images \
                      --repository-name ${ECR_REPOSITORY} \
                      --image-ids imageTag=${IMAGE_TAG} \
                      --region ${AWS_REGION}
                """
            }
        }
    }

    post {

        success {
            echo "VELGURU CI pipeline completed successfully."
            echo "Docker image pushed: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "VELGURU CI pipeline failed. Check the failed stage logs."
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
