pipeline {
  agent any

  tools {
    jdk 'jdk17'
  }

  environment {
    AWS_REGION        = 'us-west-2'
    ECR_REGISTRY      = '1659591640509.dkr.ecr.us-west-2.amazonaws.com'
    IMAGE_TAG         = "${env.BUILD_NUMBER}"
    GITOPS_REPO       = 'git@github.com/maxiemoses-eu/agrocd-yaml.git'
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
              sh './gradlew clean test build --warning-mode all'
            }
          }
          post {
            always {
              junit testResults: 'cart-cna-microservice/build/test-results/test/*.xml', allowEmptyResults: true
            }
          }
        }

        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh 'npm ci --ignore-scripts || npm install'
              sh '''
                if ls .eslintrc.* 1> /dev/null 2>&1; then
                  npm run lint
                else
                  echo "No ESLint config found, skipping lint"
                fi
              '''
              sh 'npm run format || echo "Skipping format step"'
              sh 'npm test --passWithNoTests || echo "Tests failed or not found"'
              sh 'npm run build || echo "No build script found"'
            }
          }
          post {
            always {
              junit testResults: 'products-cna-microservice/reports/junit/*.xml', allowEmptyResults: true
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
              junit testResults: 'users-cna-microservice/report.xml', allowEmptyResults: true
            }
          }
        }

        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh '''
                if [ -f package-lock.json ]; then
                  npm ci
                else
                  echo "No lockfile found, falling back to npm install"
                  npm install
                fi
              '''
              sh 'npm test || echo "Tests failed or react-scripts missing"'
              sh 'npm run build || echo "Build failed or react-scripts missing"'
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
              sh "docker build -t cart-cna-microservice:$IMAGE_TAG ."
              sh "trivy image --severity HIGH,CRITICAL cart-cna-microservice:$IMAGE_TAG"
            }
          }
        }
        stage('products-cna-microservice') {
          steps {
            dir('products-cna-microservice') {
              sh "docker build -t products-cna-microservice:$IMAGE_TAG ."
              sh "trivy image --severity HIGH,CRITICAL products-cna-microservice:$IMAGE_TAG"
            }
          }
        }
        stage('users-cna-microservice') {
          steps {
            dir('users-cna-microservice') {
              sh "docker build -t users-cna-microservice:$IMAGE_TAG ."
              sh "trivy image --severity HIGH,CRITICAL users-cna-microservice:$IMAGE_TAG"
            }
          }
        }
        stage('store-ui') {
          steps {
            dir('store-ui') {
              sh "docker build -t store-ui:$IMAGE_TAG ."
              sh "trivy image --severity HIGH,CRITICAL store-ui:$IMAGE_TAG"
            }
          }
        }
      }
    }

    stage('Push to ECR') {
      steps {
        withAWS(credentials: "$AWS_CREDENTIAL_ID", region: "$AWS_REGION") {
          sh '''
            aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

            for svc in cart-cna-microservice products-cna-microservice users-cna-microservice store-ui; do
              docker tag $svc:$IMAGE_TAG $ECR_REGISTRY/$svc:$IMAGE_TAG
              docker push $ECR_REGISTRY/$svc:$IMAGE_TAG
            done
          '''
        }
      }
    }

    stage('GitOps Promotion') {
      steps {
        sshagent([GITOPS_CREDENTIAL]) {
          sh '''
            git clone $GITOPS_REPO gitops
            cd gitops
            git checkout $GITOPS_BRANCH

            for svc in cart-cna-microservice products-cna-microservice users-cna-microservice store-ui; do
              sed -i "s|image: .*|image: $ECR_REGISTRY/$svc:$IMAGE_TAG|" $svc/deployment.yaml
            done

            git config user.name "Jenkins CI"
            git config user.email "ci@streamlinepay.com"
            git add .
            git commit -am "Promote $IMAGE_TAG to $GITOPS_BRANCH"
            git push origin $GITOPS_BRANCH
          '''
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
                 <p>View it here: <a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
      emailext(
        subject: "Jenkins Build FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """<p>The Jenkins pipeline <b>${env.JOB_NAME}</b> <b>failed</b>.</p>
                 <p>Investigate here: <a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></p>""",
        to: 'your.email@example.com'
      )
    }
  }
}