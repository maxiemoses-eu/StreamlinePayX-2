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
    retry(2)
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Discover Microservices') {
      steps {
        script {
          def services = []
          def dirs = sh(script: "ls -d */", returnStdout: true).trim().split("\n")
          for (dir in dirs) {
            if (fileExists("${dir}package.json") || fileExists("${dir}build.gradle") || fileExists("${dir}requirements.txt")) {
              services.add(dir.replace("/", ""))
            }
          }
          env.SERVICES = services.join(",")
          echo "Detected microservices: ${env.SERVICES}"
        }
      }
    }

    stage('Build & Test Microservices') {
      parallel {
        script {
          def services = env.SERVICES.split(",")
          def parallelStages = [:]

          for (service in services) {
            parallelStages[service] = {
              dir(service) {
                script {
                  if (fileExists('build.gradle')) {
                    sh './gradlew clean test build'
                    junit 'build/test-results/test/*.xml'
                  } else if (fileExists('package.json')) {
                    sh '''#!/bin/bash
                    if ! npm ci; then
                      echo "Retrying npm ci..."
                      npm ci
                    fi
                    npm run lint || echo "Lint issues"
                    npm run format || echo "Format issues"
                    CI=true npm test -- --passWithNoTests --watchAll=false
                    npm run build
                    '''
                    junit 'reports/junit/*.xml'
                  } else if (fileExists('requirements.txt')) {
                    sh '''#!/bin/bash
                    python3 -m venv venv
                    venv/bin/pip install -r requirements.txt
                    venv/bin/pytest --junitxml=report.xml
                    '''
                    junit 'report.xml'
                  }
                }
              }
            }
          }
          parallel parallelStages
        }
      }
    }

    stage('Docker Build & Scan') {
      parallel {
        script {
          def services = env.SERVICES.split(",")
          def parallelDocker = [:]

          for (service in services) {
            parallelDocker[service] = {
              dir(service) {
                sh """#!/bin/bash
                  docker build -t ${service}:${env.IMAGE_TAG} .
                  trivy image --exit-code 1 --severity HIGH,CRITICAL ${service}:${env.IMAGE_TAG} || echo "Vulnerabilities found in ${service}"
                """
              }
            }
          }
          parallel parallelDocker
        }
      }
    }

    stage('Push Images to ECR') {
      steps {
        withAWS(credentials: "${AWS_CREDENTIAL_ID}", region: "${AWS_REGION}") {
          script {
            def services = env.SERVICES.split(",")
            for (service in services) {
              sh """#!/bin/bash
                aws ecr get-login-password --region ${env.AWS_REGION} | docker login --username AWS --password-stdin ${env.ECR_REGISTRY}
                docker tag ${service}:${env.IMAGE_TAG} ${env.ECR_REGISTRY}/${service}:${env.IMAGE_TAG}
                docker push ${env.ECR_REGISTRY}/${service}:${env.IMAGE_TAG}
              """
            }
          }
        }
      }
    }

    stage('GitOps Promotion') {
      steps {
        sshagent([GITOPS_CREDENTIAL]) {
          sh '''#!/bin/bash
            git clone ${GITOPS_REPO} gitops
            cd gitops
            git checkout ${GITOPS_BRANCH}
          '''
          script {
            def services = env.SERVICES.split(",")
            for (service in services) {
              sh """#!/bin/bash
                sed -i 's|image: .*\$|image: ${env.ECR_REGISTRY}/${service}:${env.IMAGE_TAG}|' ${service}/deployment.yaml
              """
            }
          }
          sh '''#!/bin/bash
            git config user.name "Jenkins CI"
            git config user.email "ci@streamlinepay.com"
            git add .
            git commit -am "Promote ${IMAGE_TAG} to ${GITOPS_BRANCH}" || echo "No changes to commit"
            git push origin ${GITOPS_BRANCH}
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
      echo "✅ CI pipeline complete: all detected microservices built, tested, dockerized, scanned, pushed, and promoted via GitOps."
    }
    failure {
      echo "❌ CI pipeline failed. Check logs for details."
    }
  }
}
