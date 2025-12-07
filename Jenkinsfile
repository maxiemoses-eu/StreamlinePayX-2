pipeline {
  agent any

  environment {
    AWS_REGION        = 'us-west-2'
    ECR_REGISTRY      = '1659591640509.dkr.ecr.us-west-2.amazonaws.com'
    IMAGE_TAG         = "${env.BUILD_NUMBER}"
    GITOPS_REPO       = 'git@github.com:maxiemoses-eu/agrocd-yaml.git'
    GITOPS_BRANCH     = 'main'
    GITOPS_CREDENTIAL = 'gitops-ssh-key'
    AWS_CREDENTIAL_ID = 'ws-credentials-id'
  }

  options {
    timestamps()
    skipStagesAfterUnstable()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test') {
      steps {
        script {
          def buildStages = [:]

          buildStages['cart-cna-microservice'] = {
            dir('cart-cna-microservice') {
              sh 'chmod +x gradlew'
              sh './gradlew clean test build'
              junit 'build/test-results/test/*.xml'
            }
          }

          buildStages['products-cna-microservice'] = {
            dir('products-cna-microservice') {
              sh 'npm ci'
              sh 'npm run lint || echo "⚠️ Lint issues in products-cna-microservice"'
              sh 'npm run format || echo "⚠️ Format issues in products-cna-microservice"'
              sh 'npm test'
              sh 'npm run build'
              junit 'reports/junit/*.xml'
            }
          }

          buildStages['users-cna-microservice'] = {
            dir('users-cna-microservice') {
              sh '''
                python3 -m venv venv
                venv/bin/pip install -r requirements.txt
                venv/bin/pytest --junitxml=report.xml
              '''
              junit 'report.xml'
            }
          }

          buildStages['store-ui'] = {
            dir('store-ui') {
              sh '''
                if ! npm ci; then
                  echo "Retrying npm ci..."
                  npm ci
                fi
              '''
              sh 'npm run lint || echo "⚠️ Lint issues in store-ui"'
              sh 'npm run format || echo "⚠️ Format issues in store-ui"'
              sh 'npm test'
              sh 'npm run build'
            }
          }

          parallel buildStages
        }
      }
    }

    stage('Docker Build & Scan') {
      steps {
        script {
          def dockerStages = [:]

          ['cart-cna-microservice', 'products-cna-microservice', 'users-cna-microservice', 'store-ui'].each { service ->
            dockerStages[service] = {
              dir(service) {
                sh """
                  docker build -t ${service}:${env.IMAGE_TAG} .
                  trivy image --severity HIGH,CRITICAL ${service}:${env.IMAGE_TAG}
                """
              }
            }
          }

          parallel dockerStages
        }
      }
    }

    stage('Push to ECR') {
      steps {
        withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
          sh """
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

            for service in cart-cna-microservice products-cna-microservice users-cna-microservice store-ui; do
              docker tag \$service:${IMAGE_TAG} ${ECR_REGISTRY}/\$service:${IMAGE_TAG}
              docker push ${ECR_REGISTRY}/\$service:${IMAGE_TAG}
            done
          """
        }
      }
    }

    stage('GitOps Promotion') {
      steps {
        sshagent([GITOPS_CREDENTIAL]) {
          sh """
            git clone ${GITOPS_REPO} gitops
            cd gitops
            git checkout ${GITOPS_BRANCH}

            sed -i 's|image: .*cart-cna-microservice.*|image: ${ECR_REGISTRY}/cart-cna-microservice:${IMAGE_TAG}|' cart-cna-microservice/deployment.yaml
            sed -i 's|image: .*products-cna-microservice.*|image: ${ECR_REGISTRY}/products-cna-microservice:${IMAGE_TAG}|' products-cna-microservice/deployment.yaml
            sed -i 's|image: .*users-cna-microservice.*|image: ${ECR_REGISTRY}/users-cna-microservice:${IMAGE_TAG}|' users-cna-microservice/deployment.yaml
            sed -i 's|image: .*store-ui.*|image: ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}|' store-ui/deployment.yaml

            git config user.name "Jenkins CI"
            git config user.email "ci@streamlinepay.com"
            git add .
            git commit -am "Promote ${IMAGE_TAG} to ${GITOPS_BRANCH}" || echo "No changes to commit"
            git push origin ${GITOPS_BRANCH}
          """
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo "✅ CI pipeline complete: images built, scanned, pushed, and GitOps manifests updated."
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
    }
  }
}
