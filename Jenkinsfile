pipeline {
  agent any

  environment {
    AWS_REGION        = 'us-west-2'
    ECR_REGISTRY      = '1659591640509.dkr.ecr.us-west-2.amazonaws.com'
    IMAGE_TAG         = "${BUILD_NUMBER}"
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
      parallel {
        stage('cart-cna-microservice') {
          steps {
            dir('cart-cna-microservice') {
              sh 'chmod +x gradlew'
              sh './gradlew clean test build'
            }
          }
          post {
            always {
              junit 'cart-cna-microservice/build/test-results/test/*.xml'
            }
          }
        }

        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh 'npm ci'
              sh 'npm run lint || echo "⚠️ Lint issues in products-cna-microservice"'
              sh 'npm run format || echo "⚠️ Format issues in products-cna-microservice"'
              sh 'npm test'
              sh 'npm run build'
            }
          }
          post {
            always {
              junit 'products-cna-microservice/reports/junit/*.xml'
            }
          }
        }

        stage('users-cna-microservice') {
          steps {
            dir('users-cna-microservice') {
              sh '''
                python3 -m venv venv
                venv/bin/pip install -r requirements.txt
                venv/bin/pytest --junitxml=report.xml
              '''
            }
          }
          post {
            always {
              junit 'users-cna-microservice/report.xml'
            }
          }
        }

        stage('store-ui') {
          steps {
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
        }
      }
    }

    stage('Docker Build & Scan') {
      parallel {
        stage('cart-cna-microservice') {
          steps {
            dir('cart-cna-microservice') {
              sh """
                docker build -t cart-cna-microservice:${IMAGE_TAG} .
                trivy image --severity HIGH,CRITICAL cart-cna-microservice:${IMAGE_TAG}
              """
            }
          }
        }

        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh """
                docker build -t products-cna-microservice:${IMAGE_TAG} .
                trivy image --severity HIGH,CRITICAL products-cna-microservice:${IMAGE_TAG}
              """
            }
          }
        }

        stage('users-cna-microservice') {
          steps {
            dir('users-cna-microservice') {
              sh """
                docker build -t users-cna-microservice:${IMAGE_TAG} .
                trivy image --severity HIGH,CRITICAL users-cna-microservice:${IMAGE_TAG}
              """
            }
          }
        }

        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh """
                docker build -t store-ui:${IMAGE_TAG} .
                trivy image --severity HIGH,CRITICAL store-ui:${IMAGE_TAG}
              """
            }
          }
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
            git commit -am "Promote ${IMAGE_TAG} to ${GITOPS_BRANCH}"
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
      emailext(
        subject: "Jenkins Build SUCCESS: ${JOB_NAME} #${BUILD_NUMBER}",
        body: """<p>The Jenkins pipeline <b>${JOB_NAME}</b> completed <b>successfully</b>.</p>
                 <p>View it here: <a href="${BUILD_URL}">${BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
      emailext(
        subject: "Jenkins Build FAILURE: ${JOB_NAME} #${BUILD_NUMBER}",
        body: """<p>The Jenkins pipeline <b>${JOB_NAME}</b> <b>failed</b>.</p>
                 <p>Investigate here: <a href="${BUILD_URL}">${BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
  }
}
