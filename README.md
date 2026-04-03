# TaskFlow — FastAPI + ReactJS + MySQL

A full-stack task management application built to cover **Sections 5–13** of your FastAPI course.

---

## 📚 What You'll Learn

| Course Section                              | Covered By                                              |
| ------------------------------------------- | ------------------------------------------------------- |
| Section 5: FastAPI Request Method Logic     | All routers — GET, POST, PUT, PATCH, DELETE             |
| Section 6: Move Fast with FastAPI           | Project structure, dependency injection, response models |
| Section 7: Complete RESTful APIs            | Full CRUD for Users, Projects, Tasks                    |
| Section 8: Setup Database                   | SQLAlchemy engine, session, Base model (`app/db/database.py`) |
| Section 9: API Request Methods              | Every HTTP method used correctly in routers             |
| Section 10: Authentication & Authorization  | JWT login, role-based access (admin vs member)          |
| Section 11: Authenticate Requests           | `get_current_user`, `get_current_active_user`, `require_admin` dependencies |
| Section 12: Large Production Database Setup | MySQL + connection pooling, `.env` config, `check_db_connection` |
| Section 13: Alembic Data Migration          | Two real migrations in `alembic/versions/`              |

---

## 🗂 Project Structure

```
taskflow/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic settings from .env
│   │   │   └── security.py             # JWT + password hashing + auth dependencies
│   │   ├── db/
│   │   │   └── database.py             # SQLAlchemy engine, session, Base
│   │   ├── models/
│   │   │   ├── user.py                 # User ORM model
│   │   │   └── task.py                 # Task + Project ORM models
│   │   ├── schemas/
│   │   │   ├── user.py                 # Pydantic request/response schemas
│   │   │   └── task.py                 # Task + Project schemas with validators
│   │   ├── routers/
│   │   │   ├── auth.py                 # Register, login, /me, change-password
│   │   │   ├── users.py                # User CRUD (admin-protected delete)
│   │   │   ├── projects.py             # Project CRUD
│   │   │   └── tasks.py                # Task CRUD + status update + filtering
│   │   └── main.py                     # FastAPI app, CORS, router registration
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       ├── 001_initial.py          # Create users, projects, tasks tables
│   │       └── 002_add_due_date_index.py  # Add performance indexes
│   ├── alembic.ini
│   ├── seed.py                         # Populate demo data
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js               # Axios instance + all API calls
    │   ├── context/
    │   │   └── AuthContext.jsx         # Global auth state + login/logout
    │   ├── components/
    │   │   ├── Layout.jsx              # Sidebar + nav
    │   │   ├── Modal.jsx               # Reusable modal
    │   │   └── Toast.jsx               # Notification toast
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx       # Stats overview
    │   │   ├── ProjectsPage.jsx        # Project list + create
    │   │   ├── ProjectDetailPage.jsx   # Kanban board
    │   │   ├── TasksPage.jsx           # Table with filters
    │   │   ├── UsersPage.jsx           # User management
    │   │   └── ProfilePage.jsx         # Profile + change password
    │   ├── App.jsx                     # Router setup
    │   ├── main.jsx
    │   └── index.css                   # Full custom design system
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+ running locally

---

## 🚀 Setup & Run

### 1. Create the MySQL Database

```sql
CREATE DATABASE taskflow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set your MySQL credentials:
# DATABASE_URL=mysql+pymysql://YOUR_USER:YOUR_PASSWORD@localhost:3306/taskflow_db
```

### 3. Run Alembic Migrations

```bash
cd backend

# Apply migrations (creates all tables)
alembic upgrade head

# Check current migration version
alembic current

# See migration history
alembic history
```

> **What this does:** Alembic reads `alembic/versions/001_initial.py` and creates the `users`, `projects`, and `tasks` tables. Then `002_add_due_date_index.py` adds performance indexes.

### 4. Seed Demo Data *(Optional)*

```bash
cd backend
python seed.py
```

This creates:

| Email                   | Password   | Role   |
| ----------------------- | ---------- | ------ |
| `admin@taskflow.com`    | `admin123` | Admin  |
| `alice@taskflow.com`    | `alice123` | Member |
| `bob@taskflow.com`      | `bob12345` | Member |

Also creates **3 projects** and **9 tasks**.

### 5. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

| URL                             | Description   |
| ------------------------------- | ------------- |
| http://localhost:8000/docs      | Swagger Docs  |
| http://localhost:8000/redoc     | ReDoc         |
| http://localhost:8000/health    | Health Check  |

### 6. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 🔐 Authentication Flow

```
1. POST /api/auth/register   → Create account
2. POST /api/auth/login      → Returns JWT token
3. Add header: Authorization: Bearer <token>
4. GET  /api/auth/me         → Returns current user from token
```

### Testing in Swagger UI

1. Open http://localhost:8000/docs
2. Call `POST /api/auth/login` with your credentials
3. Copy the `access_token` from the response
4. Click the **Authorize** button (top right)
5. Paste the token — all protected endpoints now work

---

## 🗄️ Database

### Models

**`users`**
```
id | full_name | email | hashed_password | role | is_active | created_at | updated_at
```

**`projects`**
```
id | name | description | owner_id (FK → users) | created_at | updated_at
```

**`tasks`**
```
id | title | description | status | priority | project_id (FK) | owner_id (FK) | assignee_id (FK) | due_date | created_at | updated_at
```

### Useful Alembic Commands

```bash
# Create a new migration
alembic revision --autogenerate -m "add tags table"

# Apply all pending migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1

# Roll back all the way
alembic downgrade base
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint                    | Auth | Description          |
| ------ | --------------------------- | :--: | -------------------- |
| POST   | `/api/auth/register`        | ❌   | Register new user    |
| POST   | `/api/auth/login`           | ❌   | Login, get JWT token |
| GET    | `/api/auth/me`              | ✅   | Get my profile       |
| POST   | `/api/auth/change-password` | ✅   | Change password      |

### Projects

| Method | Endpoint            | Auth | Description             |
| ------ | ------------------- | :--: | ----------------------- |
| GET    | `/api/projects/`    | ✅   | List projects           |
| POST   | `/api/projects/`    | ✅   | Create project          |
| GET    | `/api/projects/{id}`| ✅   | Get project + tasks     |
| PUT    | `/api/projects/{id}`| ✅   | Update project          |
| DELETE | `/api/projects/{id}`| ✅   | Delete project          |

### Tasks

| Method | Endpoint                 | Auth | Description                  |
| ------ | ------------------------ | :--: | ---------------------------- |
| GET    | `/api/tasks/`            | ✅   | List tasks (with filters)    |
| POST   | `/api/tasks/`            | ✅   | Create task                  |
| GET    | `/api/tasks/my-tasks`    | ✅   | Tasks assigned to me         |
| GET    | `/api/tasks/{id}`        | ✅   | Get single task              |
| PATCH  | `/api/tasks/{id}`        | ✅   | Partial update               |
| PUT    | `/api/tasks/{id}/status` | ✅   | Quick status change          |
| DELETE | `/api/tasks/{id}`        | ✅   | Delete task                  |

### Users

| Method | Endpoint         | Auth       | Description  |
| ------ | ---------------- | :--------: | ------------ |
| GET    | `/api/users/`    | ✅         | List users   |
| GET    | `/api/users/{id}`| ✅         | Get user     |
| PUT    | `/api/users/{id}`| ✅         | Update user  |
| DELETE | `/api/users/{id}`| 🔐 Admin  | Delete user  |

---

## 💡 Key Learning Points

### Dependency Injection *(FastAPI's Superpower)*

```python
# Chain dependencies: DB session → validate JWT → check active → check admin
@router.delete("/{id}")
def delete_user(
    id: int,
    db: Session = Depends(get_db),          # Injects DB session
    current_user = Depends(require_admin)    # Injects verified admin user
):
    ...
```

### Why PATCH vs PUT?

| Method  | Behavior                                                  |
| ------- | --------------------------------------------------------- |
| `PUT`   | Replaces the **entire** resource — all fields required    |
| `PATCH` | Updates **only provided fields** — partial update         |

### Alembic vs `create_all()`

| Approach                  | When to Use                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `Base.metadata.create_all()` | Simple prototypes; cannot track schema changes over time |
| Alembic                   | Version-controlled migrations; safe for production; supports up/down |

---

## 🎯 Next Steps to Extend

- Add task **comments** (new model + router)
- Add **file uploads** for task attachments
- Add **email notifications** with FastAPI `BackgroundTasks`
- Add **pagination** metadata in list responses
- Add **refresh tokens** for longer sessions
- Deploy backend to **Railway** or **Render**, frontend to **Vercel**

---

---

# TaskFlow — Docker + Kubernetes + Jenkins Deployment

> Complete CI/CD setup for the TaskFlow FastAPI + React application.

---

## 📁 File Structure

```
taskflow/                               ← project root
├── backend/                            ← FastAPI app
├── frontend/                           ← React + Vite app
├── docker/
│   ├── Dockerfile.backend              ← Multi-stage Python image
│   ├── Dockerfile.frontend             ← Multi-stage Node/Nginx image
│   └── nginx.conf                      ← Nginx config (SPA + API proxy)
├── k8s/
│   ├── 00-namespace-configmap.yaml
│   ├── 01-secrets.yaml
│   ├── 02-mysql.yaml
│   ├── 03-backend.yaml
│   ├── 04-frontend.yaml
│   └── 05-ingress.yaml
├── scripts/
│   ├── deploy.sh
│   └── rollback.sh
├── docker-compose.yml                  ← Local dev / testing
├── Jenkinsfile                         ← CI/CD pipeline
└── .env.example                        ← Environment variable template
```

---

## ✅ Prerequisites

| Tool      | Version     | Install Link                                           |
| --------- | ----------- | ------------------------------------------------------ |
| Docker    | 24+         | https://docs.docker.com/get-docker/                    |
| kubectl   | 1.28+       | https://kubernetes.io/docs/tasks/tools/                |
| minikube  | 1.32+ (dev) | https://minikube.sigs.k8s.io/docs/start/               |
| Jenkins   | 2.440+      | https://www.jenkins.io/doc/book/installing/            |
| DockerHub | account     | https://hub.docker.com/                                |

---

## Phase 1 — Run Locally with Docker Compose

### Step 1 — Set up environment variables

```bash
cp .env.example .env
nano .env   # Set your own passwords and SECRET_KEY
```

### Step 2 — Build and start all services

```bash
docker compose up --build
```

### Step 3 — Seed the database *(first time only)*

```bash
docker exec taskflow_backend python seed.py
```

### Step 4 — Verify

| URL                          | Description  |
| ---------------------------- | ------------ |
| http://localhost             | Frontend     |
| http://localhost:8000/docs   | API docs     |
| http://localhost:8000/health | Health check |

Login with `admin@taskflow.com / admin123` or `alice@taskflow.com / alice123`.

### Useful Docker Compose Commands

```bash
docker compose logs -f backend      # Stream backend logs
docker compose restart backend      # Restart one service
docker compose down                 # Stop everything
docker compose down -v              # Stop + delete volumes (wipes DB)
```

---

## Phase 2 — Push Images to DockerHub

### Step 1 — Login

```bash
docker login
```

### Step 2 — Build and tag images

```bash
export DOCKER_USER=YOUR_USERNAME

docker build -f docker/Dockerfile.backend  -t $DOCKER_USER/taskflow-backend:latest  .
docker build -f docker/Dockerfile.frontend -t $DOCKER_USER/taskflow-frontend:latest .
```

### Step 3 — Push images

```bash
docker push $DOCKER_USER/taskflow-backend:latest
docker push $DOCKER_USER/taskflow-frontend:latest
```

### Step 4 — Update Kubernetes manifests

Edit `k8s/03-backend.yaml` and `k8s/04-frontend.yaml` and replace the placeholder image names with your DockerHub username:

```yaml
image: YOUR_DOCKERHUB_USERNAME/taskflow-backend:latest
image: YOUR_DOCKERHUB_USERNAME/taskflow-frontend:latest
```

---

## Phase 3 — Deploy to Kubernetes

### Step 1 — Start your cluster

```bash
# Local dev with minikube:
minikube start --memory=4096 --cpus=2
minikube addons enable ingress

# OR connect to an existing cluster (EKS / GKE / AKS):
kubectl config use-context YOUR_CONTEXT
```

### Step 2 — Encode secrets (base64)

```bash
echo -n "your-db-password"   | base64
echo -n "your-root-password" | base64
echo -n "your-jwt-secret"    | base64
```

Paste the output values into `k8s/01-secrets.yaml`.

### Step 3 — Apply all manifests

```bash
kubectl apply -f k8s/00-namespace-configmap.yaml
kubectl apply -f k8s/01-secrets.yaml
kubectl apply -f k8s/02-mysql.yaml

# Wait for MySQL to be Ready before continuing
kubectl wait --for=condition=ready pod -l app=mysql -n taskflow --timeout=120s

kubectl apply -f k8s/03-backend.yaml
kubectl apply -f k8s/04-frontend.yaml
kubectl apply -f k8s/05-ingress.yaml
```

### Step 4 — Verify pods are running

```bash
kubectl get pods     -n taskflow
kubectl get services -n taskflow
kubectl get ingress  -n taskflow
```

Expected output:

```
NAME                            READY   STATUS    RESTARTS
mysql-0                         1/1     Running   0
taskflow-backend-xxxxx          1/1     Running   0
taskflow-backend-xxxxx          1/1     Running   0
taskflow-frontend-xxxxx         1/1     Running   0
taskflow-frontend-xxxxx         1/1     Running   0
```

### Step 5 — Access the application

```bash
# If using minikube — run in a separate terminal:
minikube tunnel

# Get ingress IP:
kubectl get ingress -n taskflow
# Then visit: http://localhost or http://your-domain.com
```

### Step 6 — Seed the database

```bash
# Find a backend pod name:
kubectl get pods -n taskflow

# Run seed inside the pod:
kubectl exec -it <taskflow-backend-pod-name> -n taskflow -- python seed.py
```

---

## Phase 4 — Set Up Jenkins CI/CD

### Step 1 — Install Jenkins

```bash
# Run Jenkins in Docker:
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial admin password:
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open http://localhost:8080 and complete the setup wizard.

### Step 2 — Install required plugins

Go to **Manage Jenkins → Plugins → Available Plugins** and install:

- Docker Pipeline
- Kubernetes CLI Plugin
- Pipeline Utility Steps
- Git Plugin *(usually pre-installed)*

### Step 3 — Add credentials

Go to **Manage Jenkins → Credentials → System → Global → Add Credential**

**DockerHub credential:**

| Field    | Value                          |
| -------- | ------------------------------ |
| Kind     | Username with password         |
| ID       | `dockerhub-credentials`        |
| Username | your DockerHub username        |
| Password | your DockerHub password/token  |

**Kubeconfig credential:**

| Field | Value                           |
| ----- | ------------------------------- |
| Kind  | Secret file                     |
| ID    | `kubeconfig-secret`             |
| File  | upload your `~/.kube/config`    |

### Step 4 — Create the Pipeline job

1. **New Item → Pipeline**
2. Name: `taskflow-pipeline`
3. Under **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: your Git repo URL
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
4. Save

### Step 5 — Update Jenkinsfile

Edit line 18 of `Jenkinsfile` and replace:

```groovy
DOCKER_REGISTRY = "your-dockerhub-username"
```

with your actual DockerHub username, then commit and push.

### Step 6 — Trigger the pipeline

Push a commit to `main` or `staging`, or manually trigger via **Build Now**.

The pipeline will:

1. ✅ Checkout code
2. ✅ Run backend tests
3. ✅ Run frontend tests
4. ✅ Build & push Docker images *(main/staging only)*
5. ✅ Deploy to staging *(staging branch)*
6. ✅ Manual approval prompt → Deploy to production *(main branch)*

---

## 🔁 Rollback

```bash
# Via script:
./scripts/rollback.sh

# Or manually:
kubectl rollout undo deployment/taskflow-backend  -n taskflow
kubectl rollout undo deployment/taskflow-frontend -n taskflow

# Check rollout history:
kubectl rollout history deployment/taskflow-backend -n taskflow
```

---

## 🛠️ Troubleshooting

| Problem                    | Command                                                          |
| -------------------------- | ---------------------------------------------------------------- |
| Pod stuck in Pending       | `kubectl describe pod <name> -n taskflow`                        |
| Backend can't reach DB     | `kubectl logs <backend-pod> -n taskflow`                         |
| Image pull error           | Check DockerHub credentials and image name spelling              |
| Ingress not working        | `kubectl describe ingress -n taskflow`                           |
| DB migration failed        | `kubectl logs <backend-pod> -n taskflow \| grep alembic`         |

---

## 🌿 Branching Strategy

| Branch      | Action                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| `feature/*` | Runs tests only                                                        |
| `staging`   | Tests → Build images → Auto-deploy to staging                         |
| `main`      | Tests → Build images → Manual approval → Deploy to production         |
