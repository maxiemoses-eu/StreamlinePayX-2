pipeline {

    agent any

    environment {
        AWS_REGION = 'us-west-2'
        HUSKY = '0'  // avoid git hook issues in CI
        PATH = "/usr/bin:${env.PATH}"   // ensures java/npm/python resolve without Jenkins tools
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            parallel {

                stage('cart-cna-microservice') {
                    steps {
                        dir('cart-cna-microservice') {
                            sh 'chmod +x gradlew'
                            sh './gradlew clean test build'
                        }
                    }
                }

                stage('products-cna-microservice') {
                    steps {
                        dir('products-cna-microservice') {
                            sh 'npm ci'
                            sh 'npm run lint || true'
                            sh 'npm run format || true'
                            sh 'npm test'
                            sh 'npm run build'
                        }
                    }
                }

                stage('users-cna-microservice') {
                    steps {
                        dir('users-cna-microservice') {
                            sh '''
                            python3 -m venv venv
                            venv/bin/pip install --upgrade pip
                            venv/bin/pip install -r requirements.txt
                            venv/bin/pytest --junitxml=report.xml
                            '''
                            junit 'users-cna-microservice/report.xml'
                        }
                    }
                }

                stage('store-ui') {
                    steps {
                        dir('store-ui') {
                            sh 'npm ci'
                            sh 'npm run lint || true'
                            sh 'npm run format || true'
                            sh 'npm test'
                            sh 'npm run build'
                        }
                    }
                }

            }
        }

        stage('Docker Build & Scan') {
            steps { echo "🛠 Placeholder for Docker Stage — enable when ready" }
        }

        stage('Push to ECR') {
            steps { echo "🛠 Placeholder for ECR Push" }
        }

        stage('GitOps Deploy') {
            steps { echo "🛠 Placeholder GitOps" }
        }
    }

    post {
        always {
            node { cleanWs() }
        }
        failure { echo "❌ Pipeline failed" }
        success { echo "🎉 Pipeline succeeded" }
    }
}
