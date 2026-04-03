// ─────────────────────────────────────────────────────────────────────
// TaskFlow — Jenkins CI/CD Pipeline
//
// Prerequisites (configure in Jenkins):
//   Credentials:
//     • dockerhub-credentials  → Username/Password  (DockerHub login)
//     • kubeconfig-secret      → Secret File        (your kubeconfig)
//   Plugins:
//     • Docker Pipeline
//     • Kubernetes CLI
//     • Pipeline Utility Steps
// ─────────────────────────────────────────────────────────────────────

pipeline {
    agent any

    // ── Pipeline-wide environment variables ───────────────────────────
    environment {
        DOCKER_REGISTRY   = "your-dockerhub-username"          // ← Replace
        BACKEND_IMAGE     = "${DOCKER_REGISTRY}/taskflow-backend"
        FRONTEND_IMAGE    = "${DOCKER_REGISTRY}/taskflow-frontend"
        IMAGE_TAG         = "${env.BUILD_NUMBER}-${env.GIT_COMMIT.take(7)}"
        K8S_NAMESPACE     = "taskflow"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    // ── Stages ────────────────────────────────────────────────────────
    stages {

        // ─────────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Checking out source code..."
                checkout scm
                script {
                    env.GIT_COMMIT_MSG = sh(
                        script: 'git log -1 --pretty=%B',
                        returnStdout: true
                    ).trim()
                    echo "Commit: ${env.GIT_COMMIT_MSG}"
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        stage('Test Backend') {
            agent {
                docker {
                    image 'python:3.11-slim'
                    args  '--user root'
                }
            }
            steps {
                echo "🧪 Running backend tests..."
                dir('backend') {
                    sh '''
                        apt-get update -qq && apt-get install -y -qq default-libmysqlclient-dev gcc pkg-config
                        pip install -q -r requirements.txt
                        pip install -q pytest pytest-asyncio httpx
                        # Run tests (skip if no tests directory yet)
                        if [ -d "tests" ]; then
                            pytest tests/ -v --tb=short
                        else
                            echo "⚠️  No tests directory found — skipping"
                        fi
                    '''
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        stage('Test Frontend') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                echo "🧪 Running frontend tests..."
                dir('frontend') {
                    sh '''
                        npm ci --frozen-lockfile
                        # Run tests if configured
                        if npm run | grep -q "^  test$"; then
                            npm test -- --watchAll=false
                        else
                            echo "⚠️  No test script found — skipping"
                        fi
                    '''
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        stage('Build & Push Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                echo "🐳 Building and pushing Docker images..."
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'

                    // Build and push backend
                    sh """
                        docker build \
                            -f docker/Dockerfile.backend \
                            -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                            -t ${BACKEND_IMAGE}:latest \
                            .
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                    """

                    // Build and push frontend
                    sh """
                        docker build \
                            -f docker/Dockerfile.frontend \
                            -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -t ${FRONTEND_IMAGE}:latest \
                            .
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                    """

                    sh 'docker logout'
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        stage('Deploy to Staging') {
            when { branch 'staging' }
            steps {
                echo "🚀 Deploying to staging..."
                withCredentials([
                    file(credentialsId: 'kubeconfig-secret', variable: 'KUBECONFIG')
                ]) {
                    sh """
                        export KUBECONFIG=${KUBECONFIG}

                        # Apply all k8s manifests
                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}

                        # Update images to new build tag
                        kubectl set image deployment/taskflow-backend \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl set image deployment/taskflow-frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        # Wait for rollout to complete
                        kubectl rollout status deployment/taskflow-backend  -n ${K8S_NAMESPACE} --timeout=120s
                        kubectl rollout status deployment/taskflow-frontend -n ${K8S_NAMESPACE} --timeout=120s
                    """
                }
            }
        }

        // ─────────────────────────────────────────────────────────────
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                // Manual approval gate before prod deploy
                input message: "Deploy build #${env.BUILD_NUMBER} to PRODUCTION?", ok: "Deploy"

                echo "🚀 Deploying to production..."
                withCredentials([
                    file(credentialsId: 'kubeconfig-secret', variable: 'KUBECONFIG')
                ]) {
                    sh """
                        export KUBECONFIG=${KUBECONFIG}

                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}

                        kubectl set image deployment/taskflow-backend \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}
                        kubectl set image deployment/taskflow-frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/taskflow-backend  -n ${K8S_NAMESPACE} --timeout=180s
                        kubectl rollout status deployment/taskflow-frontend -n ${K8S_NAMESPACE} --timeout=180s

                        echo "✅ Production deploy successful!"
                        kubectl get pods -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }

    // ── Post-build notifications ──────────────────────────────────────
    post {
        success {
            echo "✅ Pipeline succeeded — Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — Build #${env.BUILD_NUMBER}"
            // Add email/Slack notification here:
            // mail to: 'team@example.com', subject: "Build failed: ${env.JOB_NAME}"
        }
        always {
            // Clean up dangling Docker images on the Jenkins agent
            sh 'docker image prune -f || true'
        }
    }
}
