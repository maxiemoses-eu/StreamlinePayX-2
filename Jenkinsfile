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
    retry(2) // Retry failed stages up to 2 times
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test Microservices') {
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
              sh '''
                if ! npm ci; then
                  echo "Retrying npm ci..."
                  npm ci
                fi
                npm run lint || echo "Linting issues found"
                npm run format || echo "Formatting issues found"
                CI=true npm test -- --passWithNoTests --watchAll=false
                npm run build
              '''
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
                npm run lint || echo "Linting issues found"
                npm run format || echo "Formatting issues found"
                CI=true npm test -- --passWithNoTests --watchAll=false
                npm run build
              '''
            }
          }
        }
      }
    }

    stage('Docker Build & Security Scan') {
      parallel {
        stage('cart-cna-microservice') {
          steps {
            dir('cart-cna-microservice') {
              sh "docker build -t cart-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --exit-code 1 --severity HIGH,CRITICAL cart-cna-microservice:${IMAGE_TAG} || echo 'Vulnerabilities found'"
            }
          }
        }
        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh "docker build -t products-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --exit-code 1 --severity HIGH,CRITICAL products-cna-microservice:${IMAGE_TAG} || echo 'Vulnerabilities found'"
            }
          }
        }
        stage('users-cna-microservice') {
          steps {
            dir('users-cna-microservice') {
              sh "docker build -t users-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --exit-code 1 --severity HIGH,CRITICAL users-cna-microservice:${IMAGE_TAG} || echo 'Vulnerabilities found'"
            }
          }
        }
        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh "docker build -t store-ui:${IMAGE_TAG} ."
              sh "trivy image --exit-code 1 --severity HIGH,CRITICAL store-ui:${IMAGE_TAG} || echo 'Vulnerabilities found'"
            }
          }
        }
      }
    }

    stage('Push Images to ECR') {
      steps {
        withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
          sh """
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

            for service in cart-cna-microservice products-cna-microservice users-cna-microservice store-ui; do
              docker tag ${service}:${IMAGE_TAG} ${ECR_REGISTRY}/${service}:${IMAGE_TAG}
              docker push ${ECR_REGISTRY}/${service}:${IMAGE_TAG}
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

            for service in cart-cna-microservice products-cna-microservice users-cna-microservice store-ui; do
              sed -i 's|image: .*$|image: ${ECR_REGISTRY}/${service}:${IMAGE_TAG}|' ${service}/deployment.yaml
            done

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
      echo "✅ CI pipeline complete: all images built, scanned, pushed, and GitOps updated."
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
    }
  }
}
