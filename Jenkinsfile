pipeline {
    agent any

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
                            sh './gradlew clean test build'
                        }
                    }
                }
                stage('products-cna-microservice') {
                    steps {
                        dir('products-cna-microservice') {
                            sh './gradlew clean test build'
                        }
                    }
                }
                stage('users-cna-microservice') {
                    steps {
                        dir('users-cna-microservice') {
                            sh './gradlew clean test build'
                        }
                    }
                }
                stage('store-ui') {
                    steps {
                        dir('store-ui') {
                            sh 'npm install'  // REPLACED npm ci
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (fileExists("**/build/test-results/test")) {
                    junit '**/build/test-results/test/*.xml'
                } else {
                    echo "No junit tests detected – continuing..."
                }
            }
        }
    }
}
