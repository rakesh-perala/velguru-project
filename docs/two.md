# VELGURU Tech — Enterprise DevOps CI Pipeline & Real-Time Troubleshooting

> **Project:** VELGURU Tech
> **Repository:** `rakesh-perala/velguru-project`
> **Current Branch:** `feature/ci-pipeline`
> **Platform:** AWS + Jenkins + Docker + Amazon ECR
> **AWS Region:** `ap-south-2`
> **ECR Repository:** `velguru-backend`

---

# 1. Project Overview

VELGURU Tech is a realistic DevOps practice project designed to simulate how an application moves from source code to a container image through an automated CI pipeline.

The application contains:

* Angular frontend
* Spring Boot backend
* PostgreSQL database
* Docker
* Docker Compose
* Nginx reverse proxy
* Kubernetes manifests
* Terraform infrastructure

The main purpose of this project is **not to build a complicated Java application**.

The main purpose is to practice the complete DevOps lifecycle:

```text
Code
  ↓
Git
  ↓
Branching
  ↓
Pull Request
  ↓
CI
  ↓
Build
  ↓
Test
  ↓
Code Quality
  ↓
Security Scan
  ↓
Docker Image
  ↓
Container Registry
  ↓
CD
  ↓
Kubernetes
  ↓
AWS EKS
  ↓
Monitoring
```

---

# 2. Current Project Position

Before starting Jenkins, the application development and local container validation were completed.

The application was successfully tested using Docker Compose.

The backend, frontend, database and reverse proxy were working together.

After application validation, we moved to the CI phase.

Current progress:

```text
Application
    ✅

Docker
    ✅

Docker Compose
    ✅

Local End-to-End Validation
    ✅

Git Feature Branch
    ✅

Jenkins on AWS EC2
    ✅

Jenkins + Docker
    ✅

Jenkins + AWS IAM
    ✅

Amazon ECR
    ✅

Jenkins CI Pipeline
    ✅

Docker Image → ECR
    ✅

Real CI Troubleshooting
    ✅

Actual Unit Tests
    ⏳

SonarQube
    ⏳

Trivy
    ⏳

PR / Code Review
    ⏳

CD Pipeline
    ⏳

Kubernetes Deployment
    ⏳

EKS
    ⏳

Monitoring
    ⏳
```

---

# 3. Repository Structure

The important repository structure for the current CI phase is:

```text
velguru-project/
│
├── Jenkinsfile
├── README.md
├── LICENSE
│
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── target/
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── dist/
│
├── database/
│   ├── schema.sql
│   ├── data.sql
│   └── README.md
│
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   │
│   ├── frontend/
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   │
│   └── docker-compose.yml
│
├── k8s/
│   ├── backend/
│   ├── frontend/
│   ├── namespace.yaml
│   └── ingress.yaml
│
└── terraform/
    ├── aws/
    └── azure/
```

The important relationship for the Docker build is:

```text
docker/backend/Dockerfile
            │
            │ uses files from
            ▼
         backend/
            │
            ├── pom.xml
            └── src/
```

This relationship became very important during our first Jenkins build.

---

# 4. Application Validation Completed Before Jenkins

Before introducing Jenkins, the application was tested locally.

The backend was built using Maven.

The Spring Boot application successfully started.

The health endpoint was tested.

The appointment API was also tested.

Example flow:

```text
Angular Frontend
       │
       ▼
Nginx
       │
       ▼
Spring Boot Backend
       │
       ▼
PostgreSQL
```

The application was also tested through Docker Compose.

This gave us confidence that Jenkins should automate an already-working application rather than being used to discover basic application problems.

---

# 5. Why Jenkins Was Introduced

After local validation, the next problem was:

> How do we automatically build and package the application whenever developers push code?

Without Jenkins, a developer or DevOps engineer would manually execute:

```bash
git pull
cd backend
mvn clean package
mvn test
docker build
docker login
docker push
```

That is not a scalable CI process.

We therefore introduced Jenkins.

Our CI objective is:

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
Jenkins
    │
    ├── Checkout
    ├── Maven Build
    ├── Unit Test
    ├── Docker Build
    ├── ECR Login
    ├── Push
    └── Verify
    │
    ▼
Amazon ECR
```

---

# 6. Jenkins Infrastructure

Jenkins is installed on an AWS EC2 instance.

The important components are:

```text
AWS EC2
│
├── Jenkins
├── Docker
├── AWS CLI
├── Java
└── Maven
```

Jenkins runs using the Linux service account:

```text
jenkins
```

The EC2 instance uses the IAM role:

```text
velguru
```

This IAM role provides Jenkins access to AWS services such as ECR.

---

# 7. Why We Used an IAM Role Instead of AWS Access Keys

A common beginner approach is to put:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

inside Jenkins credentials or even worse, directly inside the Jenkinsfile.

We intentionally avoided putting permanent AWS keys into the project.

The architecture is:

```text
EC2
 │
 └── IAM Role: velguru
          │
          ▼
    Temporary AWS credentials
          │
          ▼
       AWS CLI
          │
          ▼
         ECR
```

The EC2 role can be used by the AWS CLI.

We verified it with:

```bash
sudo -u jenkins -H aws sts get-caller-identity
```

The returned identity showed the assumed `velguru` role.

This proves that the Jenkins service account can access AWS using the EC2 IAM role.

---

# 8. Jenkins Docker Access

Jenkins needs Docker because our pipeline builds Docker images.

The important point is:

> Docker working for the normal Linux user does not automatically mean Docker works for Jenkins.

The Jenkins service user is:

```text
jenkins
```

So we specifically tested Docker as Jenkins:

```bash
sudo -u jenkins -H docker version
```

The command successfully returned both Docker client and server information.

This confirmed:

```text
Jenkins
   │
   ▼
Docker CLI
   │
   ▼
Docker daemon
```

was working.

---

# 9. Jenkins Tool Configuration

Jenkins was configured with:

```text
Java17
Maven-3.8.7
```

The names are important.

The Jenkinsfile contains:

```groovy
tools {
    jdk 'Java17'
    maven 'Maven-3.8.7'
}
```

The names inside the Jenkinsfile must match the Jenkins tool configuration exactly.

Conceptually:

```text
Jenkins
   │
   ├── Java17
   │
   └── Maven-3.8.7
```

When the pipeline runs, Jenkins makes these tools available to the build.

---

# 10. Amazon ECR

We created a private Amazon ECR repository:

```text
velguru-backend
```

Registry:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com
```

Full image repository:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend
```

ECR configuration included:

* Private repository
* AES256 encryption
* Scan on push enabled
* Mutable image tags
* Lifecycle policy to retain the latest 10 images

The purpose of ECR is:

> Store the Docker images generated by our CI pipeline.

---

# 11. Why ECR Is Needed

Jenkins builds the Docker image.

But Jenkins should not be the permanent storage location for application images.

Instead:

```text
Jenkins
   │
   │ docker build
   ▼
Docker Image
   │
   │ docker push
   ▼
Amazon ECR
   │
   ▼
Future CD Pipeline
   │
   ▼
Kubernetes / EKS
```

Later our CD pipeline can pull a verified image from ECR and deploy it to Kubernetes.

---

# 12. Jenkins Pipeline as Code

Instead of configuring every pipeline step manually in Jenkins UI, we created:

```text
Jenkinsfile
```

at the root of the Git repository.

This is called:

> **Pipeline as Code**

The pipeline definition is version-controlled together with the application.

Advantages:

* Changes are tracked by Git
* Pipeline changes can be reviewed
* Pipeline can be reproduced
* Jenkins configuration becomes easier to manage
* Infrastructure/process becomes more transparent
* Developers and DevOps engineers can collaborate on the pipeline

---

# 13. Complete Current Jenkins Pipeline

The current Jenkinsfile is:

```groovy
pipeline {

    agent any

    tools {
        jdk 'Java17'
        maven 'Maven-3.8.7'
    }

    environment {
        AWS_REGION = 'ap-south-2'
        AWS_ACCOUNT_ID = '652310866649'
        ECR_REPOSITORY = 'velguru-backend'
        ECR_REGISTRY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_NAME = "${ECR_REGISTRY}/${ECR_REPOSITORY}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                script {
                    env.GIT_SHORT_COMMIT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()
                }

                echo "Git Commit: ${env.GIT_SHORT_COMMIT}"
            }
        }

        stage('Build') {
            steps {
                dir('backend') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Unit Test') {
            steps {
                dir('backend') {
                    sh 'mvn test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    env.IMAGE_TAG = "build-${env.BUILD_NUMBER}-${env.GIT_SHORT_COMMIT}"
                }

                sh """
                    docker build \
                      -f docker/backend/Dockerfile \
                      -t ${IMAGE_NAME}:${IMAGE_TAG} \
                      backend
                """

                echo "Docker Image: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('ECR Login') {
            steps {
                sh """
                    aws ecr get-login-password \
                      --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin \
                      ${ECR_REGISTRY}
                """
            }
        }

        stage('Push Image to ECR') {
            steps {
                sh """
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage('Verify Image') {
            steps {
                sh """
                    aws ecr describe-images \
                      --repository-name ${ECR_REPOSITORY} \
                      --image-ids imageTag=${IMAGE_TAG} \
                      --region ${AWS_REGION}
                """
            }
        }
    }

    post {

        success {
            echo "VELGURU CI pipeline completed successfully."
            echo "Docker image pushed: ${IMAGE_NAME}:${IMAGE_TAG}"
        }

        failure {
            echo "VELGURU CI pipeline failed. Check the failed stage logs."
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
```

---

# 14. Jenkinsfile Architecture

The Jenkinsfile can be understood as:

```text
pipeline
   │
   ├── agent
   │
   ├── tools
   │
   ├── environment
   │
   ├── stages
   │     │
   │     ├── Checkout
   │     ├── Build
   │     ├── Unit Test
   │     ├── Docker Build
   │     ├── ECR Login
   │     ├── Push
   │     └── Verify
   │
   └── post
         │
         ├── success
         ├── failure
         └── cleanup
```

---

# 15. Stage 1 — Checkout

Code:

```groovy
stage('Checkout') {
    steps {
        checkout scm
```

Purpose:

> Download the source code from the configured Git repository.

Jenkins obtains the code for the branch configured in the job:

```text
feature/ci-pipeline
```

After checkout, the workspace contains:

```text
workspace/
└── velguru-project/
    ├── backend/
    ├── frontend/
    ├── docker/
    ├── k8s/
    ├── terraform/
    └── Jenkinsfile
```

---

# 16. Git Commit Identification

Inside Checkout we execute:

```bash
git rev-parse --short=7 HEAD
```

Suppose the commit is:

```text
45e34de
```

Jenkins stores it as:

```text
GIT_SHORT_COMMIT=45e34de
```

Why?

Because we want to know exactly which Git version produced our Docker image.

---

# 17. Stage 2 — Maven Build

Code:

```groovy
stage('Build') {
    steps {
        dir('backend') {
            sh 'mvn clean package -DskipTests'
        }
    }
}
```

The important part is:

```groovy
dir('backend')
```

Jenkins changes the working directory to:

```text
backend/
```

Then Maven sees:

```text
pom.xml
src/
```

The command:

```bash
mvn clean package -DskipTests
```

performs the Maven package/build process.

We deliberately keep tests separate.

---

# 18. Why Build and Test Are Separate

We could execute:

```bash
mvn clean package
```

and let Maven execute tests as part of the build.

But we separated the stages because it gives us clearer CI visibility:

```text
Build
  ↓
Test
```

If Build fails:

```text
Application compilation/package problem
```

If Test fails:

```text
Automated test problem
```

This makes troubleshooting easier.

---

# 19. Stage 3 — Unit Test

Code:

```groovy
stage('Unit Test') {
    steps {
        dir('backend') {
            sh 'mvn test'
        }
    }
}
```

Purpose:

> Execute backend automated tests.

Command:

```bash
mvn test
```

Maven looks for test code under the Maven project.

---

# 20. Important Current Testing Status

Our pipeline currently executes:

```bash
mvn test
```

successfully.

However, Maven reports that there are currently no meaningful test sources/tests to execute.

Therefore we must distinguish:

```text
Maven Test Command
        ↓
      SUCCESS
```

from:

```text
Actual Unit Test Coverage
        ↓
Not implemented yet
```

This is a known next task.

Later we will add proper tests and eventually integrate quality gates.

---

# 21. Stage 4 — Docker Build

Code:

```groovy
stage('Docker Build') {
```

First:

```groovy
env.IMAGE_TAG = "build-${env.BUILD_NUMBER}-${env.GIT_SHORT_COMMIT}"
```

Suppose:

```text
BUILD_NUMBER = 2
GIT_SHORT_COMMIT = 45e34de
```

Then:

```text
IMAGE_TAG = build-2-45e34de
```

---

# 22. Docker Build Command

The command is:

```bash
docker build \
  -f docker/backend/Dockerfile \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  backend
```

This has three important pieces.

### Dockerfile

```text
-f docker/backend/Dockerfile
```

### Image name

```text
${IMAGE_NAME}:${IMAGE_TAG}
```

### Build context

```text
backend
```

This distinction is critical.

---

# 23. Docker Build Syntax

The general syntax is:

```bash
docker build -f <dockerfile> -t <image> <context>
```

For VELGURU:

```text
docker build
    │
    ├── Dockerfile
    │      ↓
    │  docker/backend/Dockerfile
    │
    ├── Image
    │      ↓
    │  ECR repository + build tag
    │
    └── Context
           ↓
         backend
```

---

# 24. Why the Docker Context Matters

Docker can only access files inside its build context.

Our Dockerfile contains instructions such as:

```dockerfile
COPY pom.xml .
COPY src ./src
```

Therefore the build context must contain:

```text
pom.xml
src/
```

These files exist under:

```text
backend/
```

So:

```text
backend
```

must be the build context.

---

# 25. REAL-TIME TROUBLESHOOTING INCIDENT #1

# Docker Build Failed in Jenkins Build #1

## Incident Number

```text
VELGURU-CI Build #1
```

## Failed Stage

```text
Docker Build
```

## Error

```text
COPY failed: file not found in build context or excluded by .dockerignore:
stat pom.xml: file does not exist
```

---

# 26. What Happened?

The initial pipeline used the repository root as the Docker build context.

Conceptually:

```bash
docker build \
  -f docker/backend/Dockerfile \
  -t IMAGE:TAG \
  .
```

The final:

```text
.
```

means:

> Use the current repository root as the Docker build context.

The Dockerfile expected:

```text
pom.xml
src/
```

But the repository root contained:

```text
backend/
```

instead.

Actual files:

```text
backend/pom.xml
backend/src/
```

Docker therefore looked for:

```text
./pom.xml
./src/
```

and could not find them.

---

# 27. Root Cause

The root cause was:

> **Incorrect Docker build context.**

The Dockerfile was designed to build from the backend project directory, but Jenkins supplied the repository root as the context.

This is a very common Docker troubleshooting issue.

---

# 28. How We Diagnosed It

We did not immediately change random Dockerfile lines.

We compared:

### Repository structure

```text
backend/
├── pom.xml
└── src/
```

with:

### Dockerfile

```dockerfile
COPY pom.xml .
COPY src ./src
```

Then we checked the Docker command.

The problem became clear:

```text
Dockerfile expects
pom.xml
src/

Docker context supplied
repository root
```

Therefore Docker could not find the expected files.

---

# 29. Fix

We changed the Docker build command from using:

```text
.
```

to:

```text
backend
```

Final command:

```groovy
docker build \
  -f docker/backend/Dockerfile \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  backend
```

Now Docker sees:

```text
backend/
├── pom.xml
└── src/
```

as the root of its build context.

---

# 30. Another Path Mistake We Avoided

At one point the Dockerfile path was considered as:

```text
../docker/backend/Dockerfile
```

That would be wrong from the Jenkins workspace root.

The Jenkins workspace is already at:

```text
velguru-project/
```

Therefore the Dockerfile path is:

```text
docker/backend/Dockerfile
```

while the context is:

```text
backend
```

Final relationship:

```text
Jenkins Workspace
│
├── docker/backend/Dockerfile
│
└── backend/
    ├── pom.xml
    └── src/
```

---

# 31. Verification of the Fix

After modifying the Jenkinsfile:

```text
git diff --check
```

was used to verify the change.

Then the Jenkinsfile was committed.

Commit:

```text
45e34de
```

Commit message:

```text
Fix Docker build context in CI pipeline
```

The change was pushed to:

```text
feature/ci-pipeline
```

Then Jenkins Build #2 was triggered.

---

# 32. Build #2 Docker Result

Docker successfully built the image.

Result:

```text
Successfully built 11820c295d7d
```

Image:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:build-2-45e34de
```

This proves that the Docker context correction worked.

---

# 33. Stage 5 — ECR Login

Code:

```groovy
stage('ECR Login') {
```

Command:

```bash
aws ecr get-login-password \
  --region ${AWS_REGION} |
docker login \
  --username AWS \
  --password-stdin \
  ${ECR_REGISTRY}
```

Purpose:

> Authenticate Docker with Amazon ECR.

The flow is:

```text
EC2 IAM Role
      │
      ▼
AWS CLI
      │
      ▼
get-login-password
      │
      ▼
Docker Login
      │
      ▼
ECR
```

---

# 34. Why `--password-stdin` Is Used

We use:

```bash
--password-stdin
```

instead of putting the password directly into the command.

The AWS CLI generates the ECR authentication password and pipes it to Docker.

This is safer than putting credentials directly into shell arguments.

---

# 35. ECR Login Result

Jenkins successfully returned:

```text
Login Succeeded
```

Therefore:

```text
Jenkins
   ↓
AWS authentication
   ↓
ECR authentication
   ↓
Docker ready to push
```

---

# 36. ECR Warning

Jenkins displayed:

```text
WARNING! Your credentials are stored unencrypted in
'/var/lib/jenkins/.docker/config.json'.
```

This did not fail the pipeline.

The login succeeded.

However, it is a legitimate security improvement area.

The Docker CLI stores authentication configuration locally unless a credential helper is configured.

For our current learning project, we documented the warning instead of treating it as a pipeline failure.

Later we can improve this using a Docker credential helper or a more controlled Jenkins authentication mechanism.

---

# 37. Stage 6 — Push Image to ECR

Code:

```groovy
stage('Push Image to ECR') {
```

Command:

```bash
docker push ${IMAGE_NAME}:${IMAGE_TAG}
```

For Build #2:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:build-2-45e34de
```

Docker uploads the image layers to ECR.

---

# 38. Why Some Layers Say "Layer Already Exists"

During the push, we saw messages such as:

```text
Layer already exists
```

This is normal.

Docker images consist of layers.

If a layer already exists in ECR, Docker does not need to upload the same layer again.

This saves:

* Network bandwidth
* Upload time
* Registry storage duplication

Only new layers need to be pushed.

---

# 39. Stage 7 — Verify Image

After pushing, we don't simply assume the image exists.

We explicitly verify it.

Command:

```bash
aws ecr describe-images \
  --repository-name velguru-backend \
  --image-ids imageTag=${IMAGE_TAG} \
  --region ${AWS_REGION}
```

Purpose:

> Confirm that the exact tag exists in ECR.

This is important because:

```text
docker push success
```

and:

```text
registry verification
```

are separate concepts.

---

# 40. Build #2 Verification Result

ECR returned:

```text
imageTags:
    build-2-45e34de
```

Digest:

```text
sha256:11820c295d7df7f34bde5acdb4d5627e7969b7f319d19f3d1cd9c6ac73611d2c
```

Therefore the image was successfully:

```text
Built
  ↓
Tagged
  ↓
Authenticated
  ↓
Pushed
  ↓
Verified
```

---

# 41. Complete Build #2 Result

```text
Checkout
   ✅

Maven Build
   ✅

Unit Test Command
   ✅

Docker Build
   ✅

ECR Login
   ✅

Push Image
   ✅

Verify Image
   ✅

Pipeline
   ✅ SUCCESS
```

The final Jenkins output was:

```text
Finished: SUCCESS
```

---

# 42. Docker Image Produced

Build #2 produced:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:build-2-45e34de
```

The image digest was:

```text
sha256:11820c295d7df7f34bde5acdb4d5627e7969b7f319d19f3d1cd9c6ac73611d2c
```

This gives us traceability:

```text
Git Commit
    │
    ▼
Jenkins Build
    │
    ▼
Docker Image Tag
    │
    ▼
ECR Image Digest
```

---

# 43. Why We Don't Depend Only on `latest`

A common beginner approach is:

```text
velguru-backend:latest
```

But this does not tell us which source code produced the image.

Our approach is:

```text
build-2-45e34de
```

Meaning:

```text
build-2
    ↓
Jenkins Build #2

45e34de
    ↓
Git commit
```

This helps with:

* Troubleshooting
* Auditing
* Rollback
* Deployment tracking
* Release traceability

---

# 44. Post Actions

The pipeline contains:

```groovy
post {
```

Post actions run after the pipeline stages.

We currently have three behaviors.

---

# 45. Success

```groovy
success {
    echo "VELGURU CI pipeline completed successfully."
}
```

This provides a clear final success message.

---

# 46. Failure

```groovy
failure {
    echo "VELGURU CI pipeline failed. Check the failed stage logs."
}
```

This gives a simple failure indication.

The real troubleshooting information still comes from the failed stage's console output.

---

# 47. Cleanup

```groovy
always {
    sh 'docker image prune -f || true'
}
```

`always` means:

> Execute this cleanup regardless of whether the pipeline succeeds or fails.

Purpose:

> Remove dangling Docker images from the Jenkins host.

During Build #2, Docker reclaimed approximately:

```text
173.8 MB
```

---

# 48. Docker Cleanup Improvement

The current command:

```bash
docker image prune -f
```

is relatively broad.

It removes dangling images.

For a dedicated learning EC2 server this is acceptable, but in a larger production Jenkins environment we should be more careful.

Future improvements can include:

* Targeted image cleanup
* Docker disk monitoring
* Workspace cleanup
* Jenkins retention policies
* Container/image retention strategy
* Dedicated build agents

---

# 49. REAL-TIME TROUBLESHOOTING #2 — Jenkins Docker Permission

## Problem

Jenkins needs to execute:

```bash
docker build
docker push
docker login
```

But Jenkins runs as:

```text
jenkins
```

not as our normal Linux user.

## Root Cause

The Jenkins user did not initially have the required Docker daemon access.

## Diagnosis

We tested:

```bash
sudo -u jenkins -H docker version
```

This is important because testing Docker as another user does not prove Jenkins can use Docker.

## Fix

The Jenkins user was added to the Docker group and Jenkins was restarted.

## Verification

We ran:

```bash
sudo -u jenkins -H docker version
```

and Docker client/server information was returned successfully.

## Lesson

Always test infrastructure permissions using the actual service account.

---

# 50. REAL-TIME TROUBLESHOOTING #3 — Jenkins AWS/ECR Access

## Problem

Jenkins needs AWS permissions to execute:

```bash
aws ecr get-login-password
aws ecr describe-images
```

and push Docker images to ECR.

## Root Cause to Avoid

We did not want to create permanent AWS access keys inside Jenkins.

## Solution

The EC2 instance uses:

```text
IAM Role: velguru
```

## Verification

We executed:

```bash
sudo -u jenkins -H aws sts get-caller-identity
```

The result showed the assumed role.

We also tested:

```bash
sudo -u jenkins -H aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

This succeeded.

## Lesson

On AWS infrastructure, prefer IAM roles and temporary credentials over hard-coded permanent credentials.

---

# 51. Security Incident — Exposed Private Key

During the project, a private SSH key was accidentally placed in the project directory and displayed in the terminal.

The key was treated as compromised.

The files were removed from the project:

```text
hotfixdevops
hotfixdevops.pub
```

No private key should ever be committed to Git.

## Lesson

Never store:

```text
*.pem
private keys
SSH private keys
AWS credentials
tokens
passwords
```

inside the repository.

If a private key is accidentally exposed, treat it as compromised and revoke/replace it rather than trusting that deleting the file is enough.

---

# 52. GitHub Authentication Lesson

The first HTTPS push attempt used a GitHub account password.

GitHub rejected it because normal account passwords are not supported for Git HTTPS authentication.

A GitHub Personal Access Token was then used.

The token was not stored in the repository.

Important rule:

> Never put a GitHub token into a Jenkinsfile, README, shell script, or Git repository.

---

# 53. Git Commits for CI

Important commits:

```text
6c84da1
Add real CI pipeline for Docker and ECR
```

This introduced the real CI pipeline.

Then:

```text
45e34de
Fix Docker build context in CI pipeline
```

This fixed the Build #1 Docker context failure.

Git history now tells the troubleshooting story:

```text
6c84da1
   │
   │ Jenkins Build #1
   │ Docker context failure
   ▼
45e34de
   │
   │ Jenkins Build #2
   │ Docker build successful
   ▼
ECR
```

---

# 54. CI Pipeline Interview Explanation

If an interviewer asks:

## "Explain your Jenkins CI pipeline."

I would answer naturally:

> "In my VELGURU project, I created a Jenkins pipeline using a Jenkinsfile stored in Git. First Jenkins checks out the code from the feature branch. Then it enters the backend directory and runs the Maven build. After that I run the Maven test command. Next I build the Spring Boot backend as a Docker image. I create a unique image tag using the Jenkins build number and Git commit ID. Jenkins then authenticates to Amazon ECR using the EC2 IAM role, pushes the image, and verifies that the exact image tag exists in ECR. So the final output of CI is a verified Docker image in ECR."

---

# 55. Docker Context Interview Answer

## "What was the Docker issue you faced?"

> "During my first Jenkins build, the Maven stages passed but the Docker build failed with a `pom.xml not found` error. I checked the Dockerfile and saw that it was copying `pom.xml` and `src`, but my Docker build context was the repository root. In my project those files were inside the backend directory. So I changed the Docker build context from the repository root to `backend` and kept the Dockerfile path as `docker/backend/Dockerfile`. After committing and pushing the fix, Jenkins Build #2 successfully built the image and pushed it to ECR."

---

# 56. Jenkins Docker Permission Interview Answer

## "How did you solve Docker permission issues in Jenkins?"

> "Jenkins runs using the Jenkins Linux service account, so I tested Docker using the Jenkins user instead of only testing it with my own account. I found that Jenkins needed Docker daemon access. I added the Jenkins user to the Docker group and restarted Jenkins. Then I verified it using `sudo -u jenkins -H docker version`."

---

# 57. AWS Credentials Interview Answer

## "How does Jenkins access AWS?"

> "Jenkins is running on an EC2 instance that has an IAM role attached. I use the AWS CLI from Jenkins, and AWS provides temporary credentials through the instance role. I verified the identity with `aws sts get-caller-identity`. I don't put permanent AWS access keys inside the Jenkinsfile."

---

# 58. ECR Interview Answer

## "How does Jenkins push Docker images to ECR?"

> "First Jenkins gets an ECR login password using the AWS CLI. Then it pipes that password to `docker login` using `--password-stdin`. After authentication, Jenkins runs `docker push` with the ECR repository and unique image tag. Finally, I use `aws ecr describe-images` to verify that the image exists."

---

# 59. Why Separate CI and CD?

Our current pipeline is **CI**.

It does:

```text
Code
 ↓
Build
 ↓
Test
 ↓
Docker
 ↓
ECR
```

It does not deploy to Kubernetes yet.

Later we will create a separate CD process:

```text
ECR
 ↓
CD Pipeline
 ↓
Kubernetes
 ↓
EKS
```

This separation is intentional.

A clean enterprise architecture commonly separates:

```text
CI
=
Build + Test + Scan + Package

CD
=
Deploy + Verify + Rollback
```

---

# 60. Why We Are Not Deploying to EKS Yet

We don't want to jump directly from:

```text
Jenkins
   ↓
EKS
```

without first implementing quality and security checks.

Our intended progression is:

```text
Git
 ↓
Build
 ↓
Test
 ↓
SonarQube
 ↓
Trivy
 ↓
Docker
 ↓
ECR
 ↓
Approval / Release
 ↓
CD
 ↓
Kubernetes
 ↓
EKS
```

This makes the project much closer to an enterprise DevOps workflow.

---

# 61. Planned SonarQube Integration

The next quality phase will introduce SonarQube.

Expected flow:

```text
Maven Build
     │
     ▼
Unit Tests
     │
     ▼
SonarQube Analysis
     │
     ▼
Quality Gate
     │
     ├── PASS → Continue
     │
     └── FAIL → Stop Pipeline
```

The purpose is to detect issues such as:

* Code smells
* Bugs
* Duplicated code
* Maintainability problems
* Security-related code findings
* Test coverage information

---

# 62. Planned Trivy Integration

After the Docker image is built, Trivy can scan it.

Expected flow:

```text
Docker Build
     │
     ▼
Trivy Image Scan
     │
     ├── PASS → Push to ECR
     │
     └── FAIL → Stop
```

The purpose is to identify known vulnerabilities in:

* OS packages
* Application dependencies
* Container image components

The exact severity gate will be defined later.

---

# 63. Planned Unit Tests

The current Maven test stage is only executing the command.

We need actual tests.

The future flow is:

```text
Developer Code
     │
     ▼
Maven Build
     │
     ▼
Unit Tests
     │
     ├── PASS
     │
     └── FAIL → Jenkins stops
```

This gives the CI pipeline real quality value.

---

# 64. Planned Git Branching Strategy

The current working branch is:

```text
feature/ci-pipeline
```

The next Git workflow should demonstrate a more realistic development model.

Conceptually:

```text
main
 │
 ├── feature/ci-pipeline
 ├── feature/unit-tests
 ├── feature/sonarqube
 └── feature/trivy
```

Then:

```text
Feature Branch
      │
      ▼
Pull Request
      │
      ▼
Code Review
      │
      ▼
CI Validation
      │
      ▼
Merge
```

---

# 65. Pull Request Strategy

The purpose of a PR is not just to merge code.

It provides:

```text
Developer
   ↓
Pull Request
   ↓
Code Review
   ↓
Automated CI
   ↓
Quality Gate
   ↓
Security Gate
   ↓
Approval
   ↓
Merge
```

This is much closer to how enterprise development teams work.

---

# 66. Future CD Architecture

Once CI is mature:

```text
Developer
   │
   ▼
GitHub
   │
   ▼
CI Jenkins
   │
   ├── Build
   ├── Test
   ├── SonarQube
   ├── Trivy
   ├── Docker
   └── ECR
          │
          ▼
      Approved Image
          │
          ▼
      CD Jenkins
          │
          ▼
     Kubernetes
          │
          ▼
         EKS
```

---

# 67. Future Kubernetes Deployment

The project already contains Kubernetes manifests.

Later they will be used for:

```text
Namespace
   │
   ├── Backend Deployment
   ├── Backend Service
   ├── Frontend Deployment
   ├── Frontend Service
   └── Ingress
```

The backend deployment will reference an ECR image.

For example conceptually:

```text
ECR
 │
 └── velguru-backend:build-X-commit
             │
             ▼
       Kubernetes Pod
             │
             ▼
       Spring Boot App
```

---

# 68. Future Monitoring

After deployment, monitoring will be introduced.

Expected architecture:

```text
Application
    │
    ▼
Kubernetes
    │
    ├── Prometheus
    │
    └── Grafana
```

Potential monitoring areas:

* CPU
* Memory
* Pod restarts
* Application health
* Request metrics
* Kubernetes resource usage
* JVM metrics

The Spring Boot application already includes Actuator, which gives us a foundation for application monitoring.

---

# 69. Enterprise-Style Final Architecture

The target VELGURU architecture is:

```text
                         DEVELOPER
                             │
                             ▼
                          GitHub
                             │
                     Pull Request / Review
                             │
                             ▼
                          Jenkins
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
           Maven          Tests         SonarQube
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                       Security Scan
                          (Trivy)
                             │
                             ▼
                       Docker Build
                             │
                             ▼
                           ECR
                             │
                             ▼
                         CD Pipeline
                             │
                             ▼
                           EKS
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
           Frontend       Backend       PostgreSQL
                             │
                             ▼
                        Monitoring
                             │
                       Prometheus/Grafana
```

---

# 70. Real DevOps Troubleshooting Method We Are Following

Whenever a Jenkins pipeline fails, we should not immediately change the Jenkinsfile randomly.

Use this process:

```text
1. Identify failed stage
        ↓
2. Read exact error
        ↓
3. Understand what Jenkins was executing
        ↓
4. Check paths / permissions / credentials / environment
        ↓
5. Reproduce the issue manually if useful
        ↓
6. Identify root cause
        ↓
7. Apply smallest correct fix
        ↓
8. Verify locally or on Jenkins
        ↓
9. Commit the fix
        ↓
10. Push
        ↓
11. Re-run pipeline
        ↓
12. Document the incident
```

This is exactly how we handled the Docker context failure.

---

# 71. Current Troubleshooting Record

## Incident 001

```text
Issue:
Docker build failed

Build:
Jenkins #1

Error:
pom.xml not found

Root Cause:
Wrong Docker build context

Fix:
Changed context from . to backend

Commit:
45e34de

Verification:
Jenkins #2 SUCCESS
```

---

## Incident 002

```text
Issue:
Jenkins Docker access

Root Cause:
Jenkins service user needed Docker access

Fix:
Added jenkins user to Docker group and restarted Jenkins

Verification:
sudo -u jenkins -H docker version
```

---

## Incident 003

```text
Issue:
Jenkins AWS/ECR access

Requirement:
Jenkins needed ECR permissions

Solution:
EC2 IAM role velguru

Verification:
aws sts get-caller-identity
aws ecr describe-repositories
```

---

## Security Incident

```text
Issue:
Private SSH key accidentally exposed

Action:
Treat key as compromised

Action:
Remove exposed files from project

Lesson:
Never store private keys in Git repositories
```

---

# 72. Current CI Pipeline Success Criteria

Our CI pipeline is considered successful when:

```text
Git checkout       → PASS
Maven build        → PASS
Tests              → PASS
Docker build       → PASS
ECR login          → PASS
Docker push        → PASS
ECR verification   → PASS
```

Build #2 achieved this.

---

# 73. Current Milestone

The current milestone can be summarized as:

```text
                VELGURU TECH
                     │
                     ▼
              Application Ready
                     │
                     ▼
             Docker Validated
                     │
                     ▼
             Jenkins Installed
                     │
                     ▼
              IAM Integrated
                     │
                     ▼
                ECR Ready
                     │
                     ▼
             Jenkins CI Ready
                     │
                     ▼
           Build #1 Troubleshooting
                     │
                     ▼
             Docker Context Fixed
                     │
                     ▼
             Build #2 SUCCESS
                     │
                     ▼
             Verified ECR Image
```

---

# 74. Current Git State

Current important branch:

```text
feature/ci-pipeline
```

Important CI commits:

```text
6c84da1
Add real CI pipeline for Docker and ECR

45e34de
Fix Docker build context in CI pipeline
```

The corrected Jenkinsfile is now pushed to GitHub.

---

# 75. Next Implementation Plan

The next phases should be completed in this order:

## Phase 1 — Git Workflow

```text
Branching strategy
      ↓
Pull Request
      ↓
Code Review
```

## Phase 2 — Testing

```text
Create real unit tests
      ↓
Maven test
      ↓
JUnit/Spring Boot tests
```

## Phase 3 — Code Quality

```text
SonarQube
      ↓
Analysis
      ↓
Quality Gate
```

## Phase 4 — Security

```text
Trivy
      ↓
Docker Image Scan
      ↓
Vulnerability Gate
```

## Phase 5 — CI Improvement

```text
Checkout
   ↓
Build
   ↓
Test
   ↓
SonarQube
   ↓
Quality Gate
   ↓
Docker Build
   ↓
Trivy
   ↓
ECR
```

## Phase 6 — CD

```text
Approved ECR Image
       ↓
Separate Jenkins CD
       ↓
Kubernetes
       ↓
EKS
```

## Phase 7 — Observability

```text
Prometheus
     +
Grafana
     +
Spring Boot Actuator
```

---

# 76. Final DevOps Interview Story

If I have to explain the entire current VELGURU CI implementation in an interview:

> "I worked on a Spring Boot, Angular and PostgreSQL application and first validated the application locally using Docker Compose. After that I created a Jenkins CI pipeline using Pipeline as Code. Jenkins runs on an AWS EC2 instance with Docker and an IAM role attached. The pipeline checks out the Git branch, builds the backend using Maven, executes tests, builds a Docker image, authenticates to ECR using the EC2 IAM role, pushes the image and verifies the image in ECR.
>
> During my first Jenkins build, the Docker stage failed because the Docker build context was the repository root while the Maven project was under the backend directory. The Dockerfile was copying `pom.xml` and `src`, so Docker could not find them. I checked the repository structure and Dockerfile, identified the context problem, changed the context to `backend`, committed the fix as `45e34de`, pushed it to GitHub and reran Jenkins. Build #2 successfully created and pushed the image to ECR.
>
> My next steps are to add real unit tests, SonarQube quality gates, Trivy security scanning, PR/code review and then create a separate CD pipeline for Kubernetes and EKS deployment."

---

# 77. Final Lessons From This Phase

### Lesson 1

**A Dockerfile and Docker build context are two different things.**

```text
Dockerfile ≠ Build Context
```

### Lesson 2

**Always test service-account permissions using the actual service account.**

```bash
sudo -u jenkins -H docker version
```

### Lesson 3

**Use AWS IAM roles on AWS infrastructure whenever possible.**

### Lesson 4

**Don't store credentials or private keys in Git.**

### Lesson 5

**Unique image tags make CI/CD traceable.**

```text
build-2-45e34de
```

### Lesson 6

**A successful test command doesn't necessarily mean the project has meaningful tests.**

### Lesson 7

**Always verify the image after pushing it to the registry.**

### Lesson 8

**When Jenkins fails, diagnose the actual error before changing configuration.**

### Lesson 9

**Document real failures.**

Real troubleshooting stories are valuable for both engineering knowledge and interviews.

---

# 78. VELGURU DevOps Philosophy

This project follows:

```text
LEARN
  ↓
PRACTICE
  ↓
BREAK
  ↓
TROUBLESHOOT
  ↓
FIX
  ↓
VERIFY
  ↓
DOCUMENT
  ↓
AUTOMATE
  ↓
IMPROVE
```

The Jenkins Build #1 failure was not a wasted build.

It became a real DevOps troubleshooting scenario.

The important outcome was not simply:

```text
Jenkins Build #2 = SUCCESS
```

The real learning was:

```text
Failure
   ↓
Understand Docker Context
   ↓
Understand Jenkins Workspace
   ↓
Understand Dockerfile COPY
   ↓
Fix Pipeline
   ↓
Verify
   ↓
Document
```

That is the practical DevOps approach we are following throughout VELGURU Tech.

---

# 79. Current Final Status

```text
┌───────────────────────────────────────────────┐
│               VELGURU TECH                    │
│                                               │
│ Application              ✅                   │
│ Docker                   ✅                   │
│ Docker Compose           ✅                   │
│ Local Validation         ✅                   │
│ Git Branch               ✅                   │
│ Jenkins                  ✅                   │
│ Jenkins Docker Access    ✅                   │
│ AWS IAM                  ✅                   │
│ Amazon ECR               ✅                   │
│ Jenkins CI               ✅                   │
│ Docker Build             ✅                   │
│ ECR Push                 ✅                   │
│ ECR Verification        ✅                   │
│ Real Troubleshooting     ✅                   │
│                                               │
│ Unit Tests               ⏳                   │
│ PR / Code Review         ⏳                   │
│ SonarQube                ⏳                   │
│ Trivy                    ⏳                   │
│ Separate CD              ⏳                   │
│ Kubernetes               ⏳                   │
│ EKS                      ⏳                   │
│ Monitoring               ⏳                   │
└───────────────────────────────────────────────┘
```

**Current milestone:**

> **VELGURU Tech has a working Jenkins CI pipeline that builds the Spring Boot backend into a Docker image, authenticates to Amazon ECR using the EC2 IAM role, pushes a uniquely tagged image, and verifies that image in ECR.**

**Next milestone:**

> **Git PR/code review → real unit tests → SonarQube → Trivy → improved CI quality/security gates.**
