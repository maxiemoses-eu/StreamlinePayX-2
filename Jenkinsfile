pipeline {
  agent any

  environment {
    NODE_ENV = 'production'
  }

  stages {
    stage('Checkout SCM') {
      steps {
        checkout scm
      }
    }

    stage('Clean Workspace') {
      steps {
        dir('store-ui') {
          echo '🧹 Cleaning workspace...'
          sh 'rm -rf node_modules package-lock.json'
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        dir('store-ui') {
          echo '📦 Installing dependencies...'
          sh 'npm install'
        }
      }
    }

    stage('Build') {
      steps {
        dir('store-ui') {
          echo '🏗️ Building the app...'
          sh 'npm run build'
        }
      }
    }

    stage('Test') {
      steps {
        dir('store-ui') {
          echo '🧪 Running tests...'
          sh 'npm test --passWithNoTests'
        }
      }
    }
  }

  post {
    success {
      echo '✅ CI pipeline completed successfully.'
    }
    failure {
      echo '❌ CI pipeline failed. Check the logs for details.'
    }
  }
}
