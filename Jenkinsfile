pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-2'
        TF_VAR_environment = 'prod'
        TF_VAR_region = "${AWS_REGION}"
        TFVARS_FILE = 'prod.tfvars'
        JAVA_HOME = tool name: 'Java17', type: 'jdk'
        PATH = "${JAVA_HOME}/bin:${env.PATH}"
        HUSKY = '0' // Disable Husky in CI
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM',
                  branches: [[name: '*/main']],
                  doGenerateSubmoduleConfigurations: false,
                  extensions: [[$class: 'CloneOption', depth: 0, noTags: false, reference: '', shallow: false]],
                  userRemoteConfigs: [[credentialsId: 'github-credentials01', url: 'https://github.com/maxiemoses-eu/StreamlinePayX-2.git']]
                ])
            }
        }

        stage('Build & Test') {
            parallel {
                stage('Cart Microservice') {
                    steps {
                        dir('cart-cna-microservice') {
                            sh './gradlew clean test build'
                        }
                    }
                }
                stage('Products Microservice') {
                    steps {
                        dir('products-cna-microservice') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run format || echo "⚠️ Format issues in products-cna-microservice"'
                            sh 'npm test'
                        }
                    }
                }
                stage('Users Microservice') {
                    steps {
                        dir('users-cna-microservice') {
                            sh 'python3 -m venv venv'
                            sh 'venv/bin/pip install --upgrade pip'
                            sh 'venv/bin/pip install -r requirements.txt'
                            sh 'venv/bin/pytest --junitxml=report.xml'
                            junit 'report.xml'
                        }
                    }
                }
                stage('Store UI') {
                    steps {
                        dir('store-ui') {
                            sh 'npm ci'
                            sh 'npm run lint'
                            sh 'npm run format || echo "⚠️ Format issues in store-ui"'
                            sh 'npm test'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker Build & Scan') {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                echo '✅ Docker build & scan placeholder'
            }
        }

        stage('Push to ECR') {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                echo '✅ Push to AWS ECR placeholder'
            }
        }

        stage('GitOps Promotion') {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                echo '✅ GitOps promotion placeholder'
            }
        }
    }

    post {
        always { cleanWs() }
        failure { echo "❌ CI pipeline failed. Check logs for details." }
    }
}
