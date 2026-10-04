# VELGURU Tech — Enterprise AWS DevOps Environment

## AWS EC2 → IAM → Linux → Jenkins → Docker → ECR → Security → Lifecycle → CI/CD Foundation

---

## 1. Project Overview

**Project Name:** VELGURU Tech

**GitHub Repository:**

```text
https://github.com/rakesh-perala/velguru-project.git
```

**Current Branch:**

```text
feature/ci-pipeline
```

**AWS Region:**

```text
ap-south-2
```

**AWS Account:**

```text
652310866649
```

The VELGURU project is an enterprise-style DevOps practice project containing:

* Angular frontend
* Spring Boot backend
* PostgreSQL database
* Docker
* Docker Compose
* Jenkins
* AWS IAM
* AWS EC2
* Amazon ECR
* Kubernetes
* Terraform
* CI/CD
* DevSecOps
* Monitoring

The application is intentionally simple enough to understand, while the DevOps infrastructure follows real-world practices.

---

# 2. Why Are We Building This Environment?

The purpose is not simply to deploy an application.

We want to practice the complete DevOps lifecycle:

```text
Developer
    |
    v
GitHub
    |
    v
Jenkins
    |
    +---- Build
    |
    +---- Test
    |
    +---- Security
    |
    +---- Docker Build
    |
    v
Amazon ECR
    |
    v
Kubernetes / EKS
    |
    v
Application
    |
    v
Monitoring
```

The same environment allows us to understand:

* How developers push code
* How Jenkins obtains source code
* How Java applications are built
* How Docker images are created
* Where Docker images are stored
* How AWS authenticates Jenkins
* How container images are scanned
* How old images are automatically cleaned
* How Kubernetes later pulls images from ECR
* How CI/CD can be automated

---

# 3. Why Do We Need Amazon ECR?

Before creating ECR, it is important to understand the problem.

Suppose we build a Docker image on Jenkins:

```text
Jenkins EC2
    |
    v
Docker Image
velguru-backend:1.0
```

Where should that image be stored?

We could leave it only on the Jenkins server.

That is not a good enterprise design.

## Problem with keeping images only on Jenkins

Imagine Jenkins builds:

```text
Build #1
Build #2
Build #3
Build #4
```

Each build creates a Docker image.

If the images exist only on Jenkins:

```text
Jenkins
 |
 +--> Docker image
 +--> Docker image
 +--> Docker image
 +--> Docker image
```

Now imagine the Jenkins EC2 instance is deleted.

The images are gone.

Also, Kubernetes/EKS cannot reliably use a private image sitting only on the Jenkins server.

---

# 4. Why ECR Solves This Problem

Amazon ECR is AWS's managed private container registry.

The architecture becomes:

```text
Jenkins
   |
   | docker build
   v
Docker Image
   |
   | docker push
   v
Amazon ECR
   |
   | image pull
   v
EKS / Kubernetes
```

Now the image is stored independently from the Jenkins server.

If Jenkins is destroyed and recreated:

```text
Old Jenkins
     X
     |
     v
New Jenkins
     |
     v
Same ECR Repository
```

The container images remain available.

---

# 5. Why ECR Instead of Docker Hub?

We could push the image to Docker Hub.

However, this project uses AWS, so ECR provides a better enterprise integration.

Advantages include:

* Private container registry
* IAM-based authentication
* AWS integration
* EKS integration
* Image scanning
* Lifecycle policies
* Encryption
* Repository-level access control
* CloudTrail integration
* AWS-native security model

Architecture:

```text
AWS IAM
   |
   v
EC2 / Jenkins
   |
   v
ECR
   |
   v
EKS
```

---

# 6. Why Do We Need IAM?

Jenkins needs to communicate with AWS.

For example:

```text
Jenkins
   |
   +--> Authenticate to ECR
   |
   +--> Push Docker image
   |
   +--> Check image
   |
   +--> Read ECR information
```

AWS needs to know:

> Who is Jenkins and what is Jenkins allowed to do?

IAM provides the answer.

---

# 7. IAM Architecture

We created an EC2 IAM role:

```text
Role Name:

velguru
```

The architecture is:

```text
EC2
 |
 v
IAM Role
velguru
 |
 v
Temporary AWS Credentials
 |
 +----------------+
 |                |
 v                v
AWS CLI         Jenkins
 |
 v
ECR
```

This is preferable to storing permanent AWS access keys on the server.

---

# 8. IAM Role vs Access Keys

There are two common authentication approaches.

## Approach 1 — Access Keys

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

These are long-lived credentials.

If somebody gets them, they may be able to access AWS according to their permissions.

Therefore they must never be:

* committed to GitHub
* stored in Jenkinsfile
* placed in Dockerfile
* written into README
* pasted into public scripts

---

## Approach 2 — IAM Role

With an EC2 IAM role:

```text
EC2
 |
 v
IAM Role
 |
 v
Temporary Credentials
 |
 v
AWS API
```

The AWS SDK/CLI can obtain temporary credentials automatically.

This is the approach we use for the EC2-based VELGURU environment.

---

# 9. IAM Role Creation

Go to:

```text
AWS Console
    |
    v
IAM
    |
    v
Roles
    |
    v
Create role
```

Choose:

```text
Trusted entity type:
AWS service
```

Select:

```text
Use case:
EC2
```

Role name:

```text
velguru
```

---

# 10. IAM Trust Policy

The role must trust EC2.

Conceptually:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

This means:

```text
EC2
 |
 | AssumeRole
 v
velguru
```

Important distinction:

### Trust policy

Answers:

> Who can assume this role?

### Permissions policy

Answers:

> What can the role do?

These are different concepts.

---

# 11. IAM Permissions for ECR

For our ECR workflow, the role needs permissions for the operations that the pipeline performs.

Typical ECR permissions include:

```text
ecr:GetAuthorizationToken

ecr:BatchCheckLayerAvailability
ecr:InitiateLayerUpload
ecr:UploadLayerPart
ecr:CompleteLayerUpload

ecr:BatchGetImage
ecr:GetDownloadUrlForLayer
ecr:PutImage

ecr:DescribeRepositories
ecr:DescribeImages
ecr:DescribeImageScanFindings
ecr:StartImageScan

ecr:GetLifecyclePolicy
ecr:PutLifecyclePolicy
```

For an enterprise production environment, permissions should be restricted to the required repository and operations.

Do not automatically use:

```text
AdministratorAccess
```

for Jenkins.

---

# 12. Attach IAM Role to EC2

After creating:

```text
velguru
```

go to:

```text
EC2
 → Instances
 → Select Instance
 → Actions
 → Security
 → Modify IAM role
```

Select:

```text
velguru
```

Save.

---

# 13. Verify IAM From EC2

Run:

```bash
aws sts get-caller-identity
```

Our actual verified result was:

```text
Account:
652310866649

Arn:
arn:aws:sts::652310866649:assumed-role/velguru/i-03ff0dc5956d045f3
```

This proves:

```text
EC2
 |
 v
velguru
 |
 v
AWS STS
```

is working.

---

# 14. AWS Region

The project uses:

```text
ap-south-2
```

Always specify the region in AWS CLI commands:

```bash
--region ap-south-2
```

This avoids accidentally creating resources in another AWS region.

---

# 15. Create EC2

Launch Ubuntu EC2.

Example:

```text
OS:
Ubuntu Server

Instance:
t3.medium

Region:
ap-south-2

IAM Role:
velguru
```

Our working EC2 information:

```text
Public IP:
3.110.41.218

Private IP:
172.31.5.47

Hostname:
ip-172-31-5-47
```

---

# 16. EC2 Security Group

Required ports should be opened only when necessary.

Typical initial setup:

```text
SSH
TCP 22

Jenkins
TCP 8080
```

For production, Jenkins should not normally be exposed broadly to the internet.

Better enterprise architecture:

```text
Internet
    |
    v
Load Balancer / Reverse Proxy
    |
    v
Jenkins
```

with appropriate network restrictions.

---

# 17. Connect to EC2

Example:

```bash
ssh -i ~/.ssh/hotfixdevops.pem ubuntu@<EC2_PUBLIC_IP>
```

Our working public IP was:

```text
3.110.41.218
```

---

# 18. Update Ubuntu

On a fresh machine:

```bash
sudo apt update
```

Then:

```bash
sudo apt upgrade -y
```

Install basic tools:

```bash
sudo apt install -y \
git \
curl \
wget \
unzip \
vim
```

---

# 19. Create Dedicated Human User

Instead of doing everything with the default Ubuntu user, create a dedicated administrator/developer account.

Username:

```text
rakesh-devops-1012
```

Create:

```bash
sudo adduser rakesh-devops-1012
```

---

# 20. Add Sudo Access

Run:

```bash
sudo usermod -aG sudo rakesh-devops-1012
```

Also:

```bash
sudo usermod -aG users rakesh-devops-1012
```

Verify:

```bash
id rakesh-devops-1012
```

The user should belong to:

```text
sudo
users
```

---

# 21. Configure SSH for New User

Create:

```bash
sudo mkdir -p /home/rakesh-devops-1012/.ssh
```

Copy authorized key:

```bash
sudo cp /home/ubuntu/.ssh/authorized_keys \
/home/rakesh-devops-1012/.ssh/authorized_keys
```

Fix ownership:

```bash
sudo chown -R \
rakesh-devops-1012:rakesh-devops-1012 \
/home/rakesh-devops-1012/.ssh
```

Permissions:

```bash
sudo chmod 700 \
/home/rakesh-devops-1012/.ssh
```

and:

```bash
sudo chmod 600 \
/home/rakesh-devops-1012/.ssh/authorized_keys
```

---

# 22. Test Human User

SSH:

```bash
ssh -i ~/.ssh/hotfixdevops.pem \
rakesh-devops-1012@<EC2_PUBLIC_IP>
```

Verify:

```bash
whoami
```

Expected:

```text
rakesh-devops-1012
```

Verify sudo:

```bash
sudo whoami
```

Expected:

```text
root
```

---

# 23. Why Create a Separate Jenkins User?

Jenkins should not run everything as:

```text
root
```

and it should not run as:

```text
rakesh-devops-1012
```

Instead:

```text
jenkins
```

is a dedicated service account.

Architecture:

```text
Human
 |
 +--> rakesh-devops-1012
 |
 +--> Manual administration


Automation
 |
 +--> jenkins
 |
 +--> CI/CD
```

This provides separation of responsibilities.

---

# 24. Install Java

Jenkins requires Java.

Install Java 17:

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-17-jre
```

Verify:

```bash
java -version
```

---

# 25. Install Jenkins

Install Jenkins using the official Jenkins repository and package.

After installation:

```bash
sudo systemctl enable jenkins
```

Start:

```bash
sudo systemctl start jenkins
```

Verify:

```bash
sudo systemctl status jenkins --no-pager
```

Expected:

```text
Active: active (running)
```

---

# 26. Verify Jenkins User

Run:

```bash
id jenkins
```

Check home:

```bash
getent passwd jenkins
```

Expected home:

```text
/var/lib/jenkins
```

Verify process:

```bash
ps -ef | grep jenkins
```

Jenkins should run under:

```text
jenkins
```

---

# 27. Jenkins Initial Setup

Initial password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Open:

```text
http://<EC2_PUBLIC_IP>:8080
```

Complete Jenkins setup.

Never put the generated password into GitHub or this README.

---

# 28. Install Docker

Run:

```bash
sudo apt update
sudo apt install -y docker.io
```

Enable:

```bash
sudo systemctl enable docker
```

Start:

```bash
sudo systemctl start docker
```

Verify:

```bash
sudo systemctl status docker --no-pager
```

Our verified Docker version:

```text
Docker version 29.1.3
```

---

# 29. Docker Permission Issue We Encountered

Initially:

```bash
docker images
```

returned a Docker socket permission error.

Why?

Docker daemon listens through:

```text
/var/run/docker.sock
```

The user did not have permission to access the socket.

---

# 30. Fix Docker Permission

For the human DevOps user:

```bash
sudo usermod -aG docker rakesh-devops-1012
```

Refresh the session:

```bash
newgrp docker
```

Verify:

```bash
docker images
```

Docker now works without:

```text
sudo docker
```

---

# 31. Important Docker Security Consideration

Membership in the Docker group is highly privileged.

Effectively:

```text
docker group
   |
   v
Powerful control over Docker
   |
   v
Potential host-level control
```

For our learning EC2 this is acceptable.

For enterprise production environments, Docker access should be tightly controlled.

---

# 32. Verify AWS Access for Jenkins

Once the Jenkins service is configured:

```bash
sudo -u jenkins aws sts get-caller-identity
```

The role should resolve to:

```text
velguru
```

This is critical because later Jenkins must execute:

```bash
aws ecr get-login-password
```

without storing AWS access keys.

---

# 33. GitHub Repository

Correct repository:

```text
https://github.com/rakesh-perala/velguru-project.git
```

Clone:

```bash
git clone -b feature/ci-pipeline \
https://github.com/rakesh-perala/velguru-project.git
```

Enter:

```bash
cd velguru-project
```

Verify:

```bash
git branch
```

Expected:

```text
* feature/ci-pipeline
```

---

# 34. VELGURU Application Architecture

The application contains:

```text
Angular
   |
   v
Nginx
   |
   v
Spring Boot
   |
   v
PostgreSQL
```

DevOps packaging:

```text
Frontend
   |
   v
Docker Image

Backend
   |
   v
Docker Image

Database
   |
   v
PostgreSQL Container
```

The backend image is the first image we are publishing to ECR.

---

# 35. Why Are We Pushing the Backend Image First?

We have:

```text
frontend
backend
database
```

The backend is a good first target because:

* Spring Boot already builds successfully
* Dockerfile already exists
* Backend has a clear deployable artifact
* ECR can store the backend image
* Kubernetes will later consume this image
* Jenkins can automate the process

Later we can create:

```text
velguru-backend
velguru-frontend
```

repositories or follow the agreed enterprise repository strategy.

---

# 36. Amazon ECR — Create Repository

There are two ways to create ECR.

## Method 1 — AWS Console

Go to:

```text
AWS Console
   |
   v
ECR
   |
   v
Repositories
   |
   v
Create repository
```

Choose:

```text
Visibility:
Private
```

Repository name:

```text
velguru-backend
```

Encryption:

```text
AES-256
```

Enable image scanning according to the repository options available in the selected ECR configuration.

Create repository.

---

# 37. Method 2 — AWS CLI

We use:

```bash
aws ecr create-repository \
  --repository-name velguru-backend \
  --region ap-south-2
```

This creates:

```text
AWS ECR
   |
   v
Private Repository
   |
   v
velguru-backend
```

---

# 38. Why Should ECR Repository Be Private?

Our application image is not intended to be public.

A private repository means:

```text
Developer
   |
   v
IAM
   |
   v
Authorized ECR Access
   |
   v
Docker Image
```

An unauthorized user cannot simply pull the image.

This is important because Docker images can contain:

* Application binaries
* Business logic
* Configuration
* Internal dependencies
* Proprietary code

Therefore:

```text
VELGURU Backend
       |
       v
Private ECR
```

---

# 39. Verify ECR Repository

Run:

```bash
aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

Our actual repository:

```text
Repository:
velguru-backend

Registry:
652310866649

Region:
ap-south-2
```

URI:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend
```

---

# 40. Understanding the ECR URI

This:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

contains several parts:

```text
652310866649
      |
      +--> AWS Account ID

.dkr.ecr
      |
      +--> Amazon Elastic Container Registry

.ap-south-2
      |
      +--> AWS Region

.amazonaws.com
      |
      +--> AWS domain

/velguru-backend
      |
      +--> Repository

:1.0
      |
      +--> Image tag
```

---

# 41. ECR Encryption

Our repository uses:

```text
AES256
```

Verify:

```bash
aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

Expected:

```json
"encryptionConfiguration": {
    "encryptionType": "AES256"
}
```

---

# 42. Why Do We Need ECR Encryption?

Container images contain application artifacts.

Encryption provides protection for stored image data.

Architecture:

```text
Docker Image
     |
     v
ECR
     |
     v
Encrypted Storage
```

For organizations requiring customer-managed encryption keys, AWS KMS-based encryption can also be considered.

---

# 43. Enable ECR Scan on Push

We configured:

```text
scanOnPush = true
```

Command:

```bash
aws ecr put-image-scanning-configuration \
  --repository-name velguru-backend \
  --image-scanning-configuration scanOnPush=true \
  --region ap-south-2
```

Verify:

```bash
aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

Expected:

```json
"imageScanningConfiguration": {
    "scanOnPush": true
}
```

---

# 44. Why Do We Need Image Scanning?

A Docker image can contain vulnerable operating-system packages or application dependencies.

Example:

```text
Docker Image
 |
 +--> Ubuntu/Debian packages
 |
 +--> Java runtime
 |
 +--> Libraries
 |
 +--> Application dependencies
```

One vulnerable component can create a security risk.

Therefore:

```text
Build
  |
  v
Scan
  |
  v
Review vulnerabilities
  |
  v
Deploy
```

This is part of DevSecOps.

---

# 45. Dockerfile Used by VELGURU Backend

Location:

```text
docker/backend/Dockerfile
```

The Dockerfile uses a multi-stage build.

Conceptually:

```text
Stage 1
Maven + JDK
    |
    v
Build JAR
    |
    v
Stage 2
Java JRE
    |
    v
Run application
```

This prevents the complete Maven build environment from being included in the runtime image.

---

# 46. Build Backend Image

Move to:

```bash
cd ~/velguru-project/backend
```

Build:

```bash
docker build \
  -f ../docker/backend/Dockerfile \
  -t velguru-backend:1.0 .
```

Verify:

```bash
docker images velguru-backend
```

Our successful image:

```text
Repository:
velguru-backend

Tag:
1.0

Image ID:
0bf6fba760a1
```

---

# 47. Why Do We Tag the Image?

Docker images need identifiable versions.

Example:

```text
velguru-backend:1.0
```

means:

```text
Repository:
velguru-backend

Version:
1.0
```

Later Jenkins will generate unique tags.

Example:

```text
velguru-backend:build-101
```

or:

```text
velguru-backend:a8f92c1
```

---

# 48. Authenticate Docker to ECR

Run:

```bash
aws ecr get-login-password \
  --region ap-south-2 | \
docker login \
  --username AWS \
  --password-stdin \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com
```

Expected:

```text
Login Succeeded
```

---

# 49. What Happens During ECR Login?

The command:

```bash
aws ecr get-login-password
```

gets an authentication token using AWS credentials.

Because EC2 has:

```text
IAM Role: velguru
```

the AWS CLI can obtain temporary credentials.

Flow:

```text
AWS CLI
   |
   v
IAM Role
velguru
   |
   v
ECR Authentication Token
   |
   v
Docker Login
```

No permanent access key needs to be placed inside the command.

---

# 50. Tag Image for ECR

Local image:

```text
velguru-backend:1.0
```

ECR image:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

Run:

```bash
docker tag \
  velguru-backend:1.0 \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

Verify:

```bash
docker images velguru-backend
```

Both tags should point to the same image ID.

---

# 51. Why Do We Need Docker Tag Before Push?

Docker needs to know where the image belongs.

Local:

```text
velguru-backend:1.0
```

does not specify an external registry.

The ECR tag:

```text
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

tells Docker:

```text
Registry:
ECR

Repository:
velguru-backend

Tag:
1.0
```

---

# 52. Push Image to ECR

Run:

```bash
docker push \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

Successful flow:

```text
Local Docker
     |
     v
Docker Image
     |
     | docker push
     v
ECR
     |
     v
velguru-backend:1.0
```

Our successful image digest:

```text
sha256:0bf6fba760a146c5d7bbdc2892df31db20043b11b009e96873d7a5c7529ebab1
```

---

# 53. Verify Image in ECR

Run:

```bash
aws ecr describe-images \
  --repository-name velguru-backend \
  --region ap-south-2
```

Our actual image:

```text
Tag:
1.0

Digest:
sha256:0bf6fba760a146c5d7bbdc2892df31db20043b11b009e96873d7a5c7529ebab1
```

This proves the push was successful.

---

# 54. What Is an Image Digest?

The tag:

```text
1.0
```

is human-friendly.

The digest:

```text
sha256:0bf6fba760a146c5d7bbdc2892df31db20043b11b009e96873d7a5c7529ebab1
```

identifies the exact image content.

Conceptually:

```text
Tag
1.0
 |
 v
Image
 |
 v
SHA256 Digest
```

This is useful for immutable deployments and traceability.

---

# 55. ECR Tag Mutability

Current repository setting:

```text
MUTABLE
```

Verify:

```bash
aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

Output contains:

```text
"imageTagMutability": "MUTABLE"
```

This means a tag such as:

```text
1.0
```

can be moved to another image.

---

# 56. Enterprise Image Tag Strategy

For a CI/CD environment, repeatedly using:

```text
latest
```

is not ideal.

Instead:

```text
velguru-backend:build-101
velguru-backend:build-102
velguru-backend:build-103
```

Better:

```text
velguru-backend:<git-sha>
```

Example:

```text
velguru-backend:a8f92c1
```

Best practical CI/CD approach:

```text
velguru-backend:build-103-a8f92c1
```

This allows us to identify:

```text
Which Jenkins build?
Which Git commit?
Which Docker image?
Which deployment?
```

---

# 57. ECR Lifecycle Policy

Without lifecycle management:

```text
Build 1
Build 2
Build 3
...
Build 1000
```

ECR can accumulate images.

That increases storage and makes repository management difficult.

Therefore we configured:

```text
Keep latest 10 images
```

---

# 58. Initial Lifecycle Policy Error

Before creating the policy:

```bash
aws ecr get-lifecycle-policy \
  --repository-name velguru-backend \
  --region ap-south-2
```

returned:

```text
LifecyclePolicyNotFoundException
```

This was expected because no lifecycle policy existed yet.

It was not an ECR repository failure.

---

# 59. Create Lifecycle Policy File

Create:

```bash
cat > ~/ecr-lifecycle-policy.json <<'EOF'
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep only the latest 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
EOF
```

Verify:

```bash
cat ~/ecr-lifecycle-policy.json
```

---

# 60. Apply Lifecycle Policy

Run:

```bash
aws ecr put-lifecycle-policy \
  --repository-name velguru-backend \
  --lifecycle-policy-text file://$HOME/ecr-lifecycle-policy.json \
  --region ap-south-2
```

Successful result confirmed:

```text
registryId:
652310866649

repositoryName:
velguru-backend
```

---

# 61. Verify Lifecycle Policy

Run:

```bash
aws ecr get-lifecycle-policy \
  --repository-name velguru-backend \
  --region ap-south-2
```

Current policy:

```text
Priority:
1

Description:
Keep only the latest 10 images

Count:
10

Action:
expire
```

This is an important enterprise housekeeping mechanism.

---

# 62. Why Did lastEvaluatedAt Show 1970?

The policy output showed:

```text
lastEvaluatedAt:
1970-01-01T00:00:00+00:00
```

This does not mean the policy creation failed.

We had only one image.

There was nothing older than the configured retention threshold to expire.

The policy itself was successfully created and returned by:

```bash
aws ecr get-lifecycle-policy
```

---

# 63. ECR Security Scan

Because scan-on-push is enabled, ECR scans the image.

We can check the findings:

```bash
aws ecr describe-image-scan-findings \
  --repository-name velguru-backend \
  --image-id imageTag=1.0 \
  --region ap-south-2
```

Our actual result:

```text
Status:
COMPLETE

Findings:
[]

Severity Counts:
{}
```

Therefore:

```text
Security Findings:
0
```

---

# 64. ECR Scan Quota Error We Encountered

We attempted:

```bash
aws ecr start-image-scan \
  --repository-name velguru-backend \
  --image-id imageTag=1.0 \
  --region ap-south-2
```

AWS returned:

```text
LimitExceededException

The scan quota per image has been exceeded.
Wait and try again.
```

This was not a repository configuration failure.

---

# 65. How We Diagnosed the Scan Error

Instead of repeatedly starting another scan, we checked:

```bash
aws ecr describe-image-scan-findings \
  --repository-name velguru-backend \
  --image-id imageTag=1.0 \
  --region ap-south-2
```

Result:

```text
imageScanStatus:
COMPLETE
```

Therefore:

```text
Scan was already completed.
```

The correct troubleshooting approach was to check the existing scan status.

---

# 66. Final ECR Configuration

Our current ECR repository is:

```text
Repository:
velguru-backend

Account:
652310866649

Region:
ap-south-2

URI:
652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend

Encryption:
AES256

Scan on Push:
true

Tag Mutability:
MUTABLE

Lifecycle:
Keep latest 10 images
```

Current image:

```text
Tag:
1.0

Digest:
sha256:0bf6fba760a146c5d7bbdc2892df31db20043b11b009e96873d7a5c7529ebab1
```

Scan:

```text
COMPLETE
```

Findings:

```text
0
```

---

# 67. Complete ECR Flow

The entire process is:

```text
1. Create IAM Role
       |
       v
2. Attach Role to EC2
       |
       v
3. Verify AWS identity
       |
       v
4. Create ECR Repository
       |
       v
5. Configure Encryption
       |
       v
6. Enable Scan on Push
       |
       v
7. Configure Lifecycle Policy
       |
       v
8. Build Docker Image
       |
       v
9. Authenticate Docker to ECR
       |
       v
10. Tag Image
       |
       v
11. Push Image
       |
       v
12. Verify Image
       |
       v
13. Verify Security Scan
       |
       v
14. Retain/Cleanup Images
```

---

# 68. Complete AWS DevOps Flow

```text
                     AWS
                      |
              +-------+-------+
              |               |
              v               v
             IAM             EC2
              |               |
              |        +------+------+
              |        |             |
              |        v             v
              |    Human User     Jenkins
              |        |             |
              |        |             |
              +--------+-------------+
                       |
                       v
                     Docker
                       |
                       v
                      ECR
                       |
             +---------+---------+
             |                   |
             v                   v
        Security Scan       Lifecycle
             |                   |
             +---------+---------+
                       |
                       v
                     EKS
                       |
                       v
                VELGURU Application
```

---

# 69. Why Jenkins Comes Before EKS

We deliberately do not create EKS immediately.

The correct learning sequence is:

```text
Application
    |
    v
Docker
    |
    v
ECR
    |
    v
Jenkins CI
    |
    v
Security
    |
    v
EKS
    |
    v
CD
```

Why?

Because Kubernetes needs a reliable container image.

Before deploying:

```text
EKS
```

we should understand:

```text
Where does the image come from?
Who builds it?
Who pushes it?
How is it tagged?
How is it scanned?
How is it cleaned?
```

ECR answers the registry part.

Jenkins will automate the process.

---

# 70. Current Jenkinsfile

The repository already contains:

```text
Jenkinsfile
```

The current basic CI flow includes:

```text
Checkout
   |
   v
Backend Maven Build
   |
   v
Unit Tests
```

The next evolution is:

```text
Checkout
   |
   v
Build
   |
   v
Unit Test
   |
   v
Docker Build
   |
   v
ECR Login
   |
   v
Docker Tag
   |
   v
Docker Push
   |
   v
Security
```

---

# 71. Target Enterprise Jenkins Pipeline

```text
Developer
    |
    | git push
    v
GitHub
    |
    | webhook
    v
Jenkins
    |
    +--> Checkout
    |
    +--> Maven Build
    |
    +--> Unit Test
    |
    +--> SonarQube
    |
    +--> Docker Build
    |
    +--> Trivy
    |
    +--> ECR Login
    |
    +--> Generate Image Tag
    |
    +--> Docker Push
    |
    v
Amazon ECR
    |
    v
EKS
```

---

# 72. Why Security Is Before Deployment

We do not want:

```text
Build
 |
 v
Deploy
 |
 v
Discover vulnerability
```

Instead:

```text
Build
 |
 v
Test
 |
 v
Scan
 |
 v
Approve
 |
 v
Deploy
```

This is the basic DevSecOps philosophy.

---

# 73. Future DevSecOps Tools

The planned project will progressively introduce:

```text
SonarQube
    |
    v
Code Quality

Trivy
    |
    v
Container Security

OWASP ZAP
    |
    v
Application Security

ECR Scan
    |
    v
Container Registry Security
```

---

# 74. Enterprise Repository Strategy

Current repository:

```text
velguru-backend
```

Future repositories may include:

```text
velguru-backend
velguru-frontend
```

or an organization-specific structure.

Repository naming should be:

* predictable
* lowercase
* application-specific
* environment-independent

Avoid names such as:

```text
test
newrepo
final
final2
dockerimage
latestrepo
```

Prefer:

```text
velguru-backend
velguru-frontend
```

---

# 75. Enterprise Environment Separation

In a larger organization we would normally separate environments:

```text
Development
     |
     v
Testing
     |
     v
Staging
     |
     v
Production
```

This can be implemented through:

* separate AWS accounts
* separate ECR repositories
* separate EKS clusters
* separate namespaces
* separate IAM roles
* separate pipelines

For our learning project, we are starting with a single AWS environment and will introduce separation gradually.

---

# 76. Enterprise IAM Separation

A mature architecture should eventually have different roles.

Example:

```text
Developer Role
    |
    +--> Read/limited access

Jenkins Role
    |
    +--> Build
    +--> ECR Push

Deployment Role
    |
    +--> EKS Deployment

Operations Role
    |
    +--> Monitoring
    +--> Troubleshooting
```

This is safer than giving one role unlimited access.

---

# 77. Important Security Rules

Never store:

```text
AWS Access Key
AWS Secret Key
SSH Private Key
Database Password
Jenkins Password
API Token
```

inside Git.

Never put secrets into:

```text
Dockerfile
Jenkinsfile
README.md
GitHub repository
```

Use:

```text
IAM Roles
Jenkins Credentials
AWS Secrets Manager
Parameter Store
Kubernetes Secrets
```

according to the use case.

---

# 78. ECR Production Hardening

For a production implementation, we should consider:

### Encryption

```text
AES256
```

or customer-managed KMS keys when required.

### Image scanning

```text
scanOnPush
```

plus additional DevSecOps scanning.

### Lifecycle policy

Automatically remove obsolete images.

### Immutable tags

Consider:

```text
IMMUTABLE
```

for release repositories.

### Least privilege

Restrict Jenkins permissions to required ECR actions.

### Audit

Use AWS CloudTrail and appropriate logging.

---

# 79. Why Not Use `latest`?

Suppose:

```text
latest
```

points to image A today.

Tomorrow Jenkins pushes image B.

Now:

```text
latest
```

points to B.

If Kubernetes is using:

```text
latest
```

we cannot easily determine which exact version was deployed.

With:

```text
velguru-backend:a8f92c1
```

we know exactly which Git commit produced the image.

Therefore:

```text
Immutable Version
       |
       v
Traceability
       |
       v
Reliable Deployment
```

---

# 80. Disaster Recovery Thinking

Suppose the Jenkins EC2 instance is accidentally deleted.

If images are stored only locally:

```text
Jenkins Deleted
     |
     v
Images Lost
```

With ECR:

```text
Jenkins Deleted
     |
     v
ECR Still Exists
     |
     v
New Jenkins
     |
     v
Same Images
```

This is one of the major reasons we created ECR.

---

# 81. Rebuilding Everything on a New EC2

If the current EC2 is deleted, the process should be:

```text
1. Launch new Ubuntu EC2

2. Attach IAM Role:
   velguru

3. Verify:
   aws sts get-caller-identity

4. Create:
   rakesh-devops-1012

5. Configure SSH

6. Configure sudo

7. Install Java

8. Install Jenkins

9. Verify Jenkins

10. Install Docker

11. Configure Docker

12. Install Git

13. Clone GitHub repository

14. Verify AWS access

15. Verify ECR repository

16. Login to ECR

17. Build Docker image

18. Tag image

19. Push image

20. Verify image

21. Verify security scan

22. Verify lifecycle policy

23. Continue Jenkins automation
```

The ECR repository does not need to be recreated just because the Jenkins EC2 instance was recreated.

That is another major advantage of separating:

```text
Compute
```

from:

```text
Container Registry
```

---

# 82. Important Commands — Quick Reference

## AWS Identity

```bash
aws sts get-caller-identity
```

## Repository

```bash
aws ecr describe-repositories \
  --repository-names velguru-backend \
  --region ap-south-2
```

## Docker Login

```bash
aws ecr get-login-password \
  --region ap-south-2 | \
docker login \
  --username AWS \
  --password-stdin \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com
```

## Build

```bash
cd ~/velguru-project/backend

docker build \
  -f ../docker/backend/Dockerfile \
  -t velguru-backend:1.0 .
```

## Tag

```bash
docker tag \
  velguru-backend:1.0 \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

## Push

```bash
docker push \
  652310866649.dkr.ecr.ap-south-2.amazonaws.com/velguru-backend:1.0
```

## Verify Images

```bash
aws ecr describe-images \
  --repository-name velguru-backend \
  --region ap-south-2
```

## Scan

```bash
aws ecr describe-image-scan-findings \
  --repository-name velguru-backend \
  --image-id imageTag=1.0 \
  --region ap-south-2
```

## Lifecycle

```bash
aws ecr get-lifecycle-policy \
  --repository-name velguru-backend \
  --region ap-south-2
```

---

# 83. Actual VELGURU Verification Results

## IAM

```text
Account:
652310866649

Role:
velguru

Assumed Role:
arn:aws:sts::652310866649:assumed-role/velguru/i-03ff0dc5956d045f3
```

## EC2

```text
Public IP:
3.110.41.218

Private IP:
172.31.5.47

Hostname:
ip-172-31-5-47
```

## Human User

```text
rakesh-devops-1012
```

## Jenkins User

```text
jenkins
```

## Docker

```text
Docker 29.1.3
```

## ECR

```text
Repository:
velguru-backend

Region:
ap-south-2

Account:
652310866649

Encryption:
AES256

Scan on Push:
true
```

## Image

```text
Tag:
1.0

Digest:
sha256:0bf6fba760a146c5d7bbdc2892df31db20043b11b009e96873d7a5c7529ebab1
```

## Security Scan

```text
Status:
COMPLETE

Findings:
0
```

## Lifecycle

```text
Keep latest:
10 images
```

---

# 84. Troubleshooting — Docker Permission

### Error

```text
permission denied while trying to connect to Docker daemon
```

### Root Cause

The Linux user was not a member of the Docker group.

### Solution

```bash
sudo usermod -aG docker rakesh-devops-1012
newgrp docker
```

### Verification

```bash
docker images
```

### Interview Answer

> I initially got a Docker socket permission error. I checked the user permissions and found that my DevOps user was not part of the Docker group. I added the user to the Docker group, refreshed the session, and verified that Docker commands worked successfully.

---

# 85. Troubleshooting — ECR Lifecycle Policy

### Error

```text
LifecyclePolicyNotFoundException
```

### Cause

No lifecycle policy existed.

### Solution

Create the JSON policy and run:

```bash
aws ecr put-lifecycle-policy \
  --repository-name velguru-backend \
  --lifecycle-policy-text file://$HOME/ecr-lifecycle-policy.json \
  --region ap-south-2
```

### Verification

```bash
aws ecr get-lifecycle-policy \
  --repository-name velguru-backend \
  --region ap-south-2
```

---

# 86. Troubleshooting — ECR Scan Quota

### Error

```text
LimitExceededException

The scan quota per image has been exceeded.
```

### Incorrect approach

Do not continuously execute:

```bash
aws ecr start-image-scan
```

### Correct approach

Check the current scan:

```bash
aws ecr describe-image-scan-findings \
  --repository-name velguru-backend \
  --image-id imageTag=1.0 \
  --region ap-south-2
```

Our result:

```text
COMPLETE
```

Therefore the scan was already successful.

---

# 87. Interview Question — Why ECR?

### Simple answer

> I used Amazon ECR because Kubernetes or EKS needs a reliable container registry from which it can pull Docker images. Instead of keeping images only on the Jenkins server, I pushed the images to a private AWS ECR repository. ECR also integrates with IAM, image scanning, encryption and lifecycle policies.

---

# 88. Interview Question — How Did You Push the Docker Image to ECR?

### Answer

> First I created the private ECR repository. Then I authenticated Docker using `aws ecr get-login-password`. After that I built the Docker image, tagged it with the ECR repository URI, and pushed it using `docker push`. Finally I used `aws ecr describe-images` to verify the image and its digest.

---

# 89. Interview Question — How Did Jenkins Authenticate to AWS?

### Answer

> The EC2 instance has an IAM role called `velguru`. Jenkins runs on the same EC2 instance, so AWS CLI can obtain temporary credentials through the EC2 role. I don't want to store permanent AWS access keys inside Jenkins or the Jenkinsfile.

---

# 90. Interview Question — Why Lifecycle Policy?

### Answer

> Jenkins creates Docker images continuously. If we keep every image forever, ECR storage keeps growing. I configured an ECR lifecycle policy to retain the latest 10 images and expire older images automatically.

---

# 91. Interview Question — Why Scan Docker Images?

### Answer

> A Docker image contains an operating system layer, runtime and application dependencies. Any of those components can contain vulnerabilities. I enabled ECR image scanning so that images are checked for known vulnerabilities before they are used in the deployment process.

---

# 92. Interview Question — Why Use Image Digest?

### Answer

> A Docker tag is human-readable but can be changed when tags are mutable. A SHA256 digest identifies the exact image content. For production deployments, I prefer unique version or Git SHA tags and can also use the digest for stronger immutability and traceability.

---

# 93. Enterprise DevOps Principle

The important lesson from this setup is:

```text
Don't just install tools.

Understand:
    Why?
    What?
    How?
    Who?
    Where?
    Security?
    Verification?
    Troubleshooting?
    Automation?
```

For every component we should document:

```text
Purpose
   ↓
Architecture
   ↓
Installation
   ↓
Configuration
   ↓
Authentication
   ↓
Authorization
   ↓
Verification
   ↓
Troubleshooting
   ↓
Security
   ↓
Automation
```

---

# 94. Current Project Progress

```text
====================================================
VELGURU TECH — AWS DEVOPS
====================================================

Application
    |
    +--> Angular                  COMPLETE
    +--> Spring Boot              COMPLETE
    +--> PostgreSQL               COMPLETE
    +--> Docker Compose           COMPLETE
    +--> Local E2E Test           COMPLETE

GitHub
    |
    +--> Repository               COMPLETE
    +--> feature/ci-pipeline      COMPLETE

AWS
    |
    +--> EC2                     COMPLETE
    +--> IAM Role velguru        COMPLETE
    +--> IAM Verification        COMPLETE

Linux
    |
    +--> Dedicated User          COMPLETE
    +--> sudo                    COMPLETE
    +--> SSH                     COMPLETE

Jenkins
    |
    +--> Installation            COMPLETE
    +--> Service Account         COMPLETE

Docker
    |
    +--> Installation            COMPLETE
    +--> Permission              COMPLETE

ECR
    |
    +--> Repository              COMPLETE
    +--> Private Registry        COMPLETE
    +--> AES256 Encryption       COMPLETE
    +--> Scan on Push            ENABLED
    +--> Docker Login            COMPLETE
    +--> Image Build             COMPLETE
    +--> Image Push              COMPLETE
    +--> Image Verification      COMPLETE
    +--> Security Scan           COMPLETE
    +--> Lifecycle Policy        COMPLETE

Jenkins Automation
    |
    +--> Basic CI                STARTED
    +--> Docker Build            NEXT
    +--> ECR Push                NEXT
    +--> Automated Tagging       NEXT

Security
    |
    +--> ECR Scan                COMPLETE
    +--> SonarQube               PLANNED
    +--> Trivy                   PLANNED
    +--> OWASP ZAP               PLANNED

Kubernetes
    |
    +--> EKS                     LATER

Monitoring
    |
    +--> Prometheus              LATER
    +--> Grafana                 LATER

====================================================
```

---

# 95. Final Target Architecture

```text
                              DEVELOPER
                                  |
                                  | git push
                                  v
                              GITHUB
                                  |
                                  | webhook
                                  v
                              JENKINS
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
           BUILD                TEST              SONARQUBE
              |                   |                   |
              +-------------------+-------------------+
                                  |
                                  v
                             DOCKER BUILD
                                  |
                                  v
                                TRIVY
                                  |
                                  v
                              ECR LOGIN
                                  |
                                  v
                             IMAGE TAG
                                  |
                                  v
                             DOCKER PUSH
                                  |
                                  v
                        +-------------------+
                        |       AWS ECR     |
                        |                   |
                        | velguru-backend   |
                        +---------+---------+
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
              Image Scanning              Lifecycle Policy
                    |                           |
                    +-------------+-------------+
                                  |
                                  v
                                EKS
                                  |
                    +-------------+-------------+
                    |                           |
                    v                           v
                Frontend                    Backend
                                               |
                                               v
                                           PostgreSQL
                                               |
                                               v
                                          Monitoring
                                               |
                                    +----------+----------+
                                    |                     |
                                    v                     v
                               Prometheus              Grafana
```

---

# 96. Final Objective

The final goal is not simply:

```text
Jenkins → ECR
```

The goal is a complete enterprise-style DevOps workflow:

```text
CODE
  ↓
GIT
  ↓
PULL REQUEST
  ↓
CODE REVIEW
  ↓
JENKINS
  ↓
BUILD
  ↓
UNIT TEST
  ↓
SONARQUBE
  ↓
DOCKER BUILD
  ↓
TRIVY
  ↓
ECR
  ↓
IMAGE SCAN
  ↓
EKS
  ↓
DEPLOYMENT
  ↓
HEALTH CHECK
  ↓
PROMETHEUS
  ↓
GRAFANA
```

This is the direction of the VELGURU Tech enterprise DevOps project.

---

# 97. Golden Rule for This Project

Every change should follow:

```text
UNDERSTAND
    ↓
IMPLEMENT
    ↓
VERIFY
    ↓
TROUBLESHOOT
    ↓
DOCUMENT
    ↓
AUTOMATE
```

The actual errors encountered during this project are valuable learning material and should be preserved in:

```text
REAL-TIME-DEVOPS-TROUBLESHOOTING.md
```

including:

* Docker permission error
* ECR scan quota error
* ECR lifecycle policy not found
* IAM authentication verification
* Any future Jenkins/Docker/ECR errors
* Any future Kubernetes/EKS errors

---

# 98. Current Golden State

At this checkpoint:

```text
EC2
  |
  v
IAM Role: velguru
  |
  v
rakesh-devops-1012
  |
  +------ Jenkins
  |         |
  |         v
  |       Docker
  |         |
  +---------+
            |
            v
          ECR
            |
            +--> velguru-backend:1.0
            |
            +--> Scan: COMPLETE
            |
            +--> Findings: 0
            |
            +--> Lifecycle: Latest 10
```

The AWS ECR foundation is therefore complete.

The next major step is to take the commands we manually executed and turn them into a proper **Jenkins enterprise CI pipeline**.
