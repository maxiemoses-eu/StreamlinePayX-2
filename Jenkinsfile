pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Clean Workspace') {
            steps {
                sh '''
                    echo "Cleaning workspace..."
                    rm -rf node_modules package-lock.json
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Installing dependencies..."
                    npm install
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    echo "Running build..."
                    npm run build
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    echo "Running tests..."
                    npm test --passWithNoTests
                '''
            }
        }

        stage('Format Check') {
            steps {
                sh '''
                    echo "Checking code formatting..."
                    npm run format || echo "Formatting issues found"
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build and test succeeded!'
        }
        failure {
            echo 'Build or test failed. Check logs for details.'
        }
    }
}
