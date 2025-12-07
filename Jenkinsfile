pipeline {

    agent any

    environment {
        AWS_REGION = 'us-west-2'
        HUSKY      = '0'
        PATH       = "/usr/bin:${env.PATH}"
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
                    post { always { junit 'cart-cna-microservice/build/test-results/test/*.xml' } }
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
                    post { always { junit 'products-cna-microservice/reports/junit/*.xml' } }
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
                        }
                    }
                    post { always { junit 'users-cna-microservice/report.xml' } }
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
            steps {
                echo "🔒 Docker Build + Trivy scan ready — enable when ECR is configured"
            }
        }

        stage('Push to ECR') {
            steps {
                echo "📦 ECR push disabled until credentials confirmed"
            }
        }

        stage('GitOps Deploy') {
            steps {
                echo "🚀 GitOps Deployment stage ready"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success { echo "🎉 Pipeline completed successfully" }
        failure { echo "❌ Pipeline failed — check logs" }
    }
}
