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
      parallel failFast: true, stages: {
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
              sh 'npm run lint'
              sh 'npm run format'
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
                . venv/bin/activate && pip install -r requirements.txt && pytest
              '''
            }
          }
        }
        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh 'npm ci || npm ci'
              sh 'npm test'
              sh 'npm run build'
            }
          }
        }
      }
    }

    stage('Docker Build & Scan') {
      parallel failFast: true, stages: {
        stage('cart-cna-microservice') {
          steps {
            dir('cart-cna-microservice') {
              sh "docker build -t cart-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --severity HIGH,CRITICAL cart-cna-microservice:${IMAGE_TAG}"
            }
          }
        }
        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh "docker build -t products-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --severity HIGH,CRITICAL products-cna-microservice:${IMAGE_TAG}"
            }
          }
        }
        stage('users-cna-microservice') {
          steps {
            dir('users-cna-microservice') {
              sh "docker build -t users-cna-microservice:${IMAGE_TAG} ."
              sh "trivy image --severity HIGH,CRITICAL users-cna-microservice:${IMAGE_TAG}"
            }
          }
        }
        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh "docker build -t store-ui:${IMAGE_TAG} ."
              sh "trivy image --severity HIGH,CRITICAL store-ui:${IMAGE_TAG}"
            }
          }
        }
      }
    }

    stage('Push to ECR') {
      steps {
        echo "🔐 Logging in to AWS ECR using withAWS credentials block..."
        withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
          sh """
            echo "Authenticating with ECR..."
            aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

            echo "Tagging and pushing cart-cna-microservice..."
            docker tag cart-cna-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/cart-cna-microservice:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/cart-cna-microservice:${IMAGE_TAG}

            echo "Tagging and pushing products-cna-microservice..."
            docker tag products-cna-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/products-cna-microservice:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/products-cna-microservice:${IMAGE_TAG}

            echo "Tagging and pushing users-cna-microservice..."
            docker tag users-cna-microservice:${IMAGE_TAG} ${ECR_REGISTRY}/users-cna-microservice:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/users-cna-microservice:${IMAGE_TAG}

            echo "Tagging and pushing store-ui..."
            docker tag store-ui:${IMAGE_TAG} ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}
            docker push ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}
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
          """
          sh """
            sed -i 's|image: .*\$|image: ${ECR_REGISTRY}/cart-cna-microservice:${IMAGE_TAG}|' gitops/cart-cna-microservice/deployment.yaml
            sed -i 's|image: .*\$|image: ${ECR_REGISTRY}/products-cna-microservice:${IMAGE_TAG}|' gitops/products-cna-microservice/deployment.yaml
            sed -i 's|image: .*\$|image: ${ECR_REGISTRY}/users-cna-microservice:${IMAGE_TAG}|' gitops/users-cna-microservice/deployment.yaml
            sed -i 's|image: .*\$|image: ${ECR_REGISTRY}/store-ui:${IMAGE_TAG}|' gitops/store-ui/deployment.yaml
          """
          sh """
            cd gitops
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
        subject: "Jenkins Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """<p>The Jenkins pipeline <b>${env.JOB_NAME}</b> completed <b>successfully</b>.</p>
                 <p>View it here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
      emailext(
        subject: "Jenkins Build FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """<p>The Jenkins pipeline <b>${env.JOB_NAME}</b> <b>failed</b>.</p>
                 <p>Investigate here: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
  }
}
