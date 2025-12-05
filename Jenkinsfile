pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Clean Workspace') {
            steps {
                dir('store-ui') {
                    sh '''
                        echo "🧹 Cleaning workspace..."
                        rm -rf node_modules package-lock.json
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('store-ui') {
                    sh '''
                        echo "📦 Installing dependencies..."
                        npm install
                    '''
                }
            }
        }

        stage('Build') {
            steps {
                dir('store-ui') {
                    sh '''
                        echo "🏗️ Building the app..."
                        npm run build
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                dir('store-ui') {
                    sh '''
                        echo "🧪 Running tests..."
                        npm test --passWithNoTests
                    '''
                }
            }
        }

        stage('Format Check') {
            steps {
                dir('store-ui') {
                    sh '''
                        echo "🧼 Checking formatting..."
                        npm run format || echo "Formatting issues found"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and test passed!'
        }
        failure {
            echo '❌ Build or test failed. Check logs.'
        }
    }
}
