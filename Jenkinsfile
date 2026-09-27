pipeline {
    agent any

    tools {
        jdk 'Java17'
        maven 'Maven-3.8.7'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Test') {
            steps {
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }
    }

    post {
        success {
            echo 'VELGURU CI pipeline completed successfully.'
        }

        failure {
            echo 'VELGURU CI pipeline failed. Check the stage logs.'
        }
    }
}
