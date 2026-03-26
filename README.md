# TaskFlow — FastAPI + ReactJS + MySQL Project

A full-stack task management application built to cover **Sections 5–13** of your FastAPI course.

---

## 📚 About This Project

| Topics | Covered By |
|---|---|
| FastAPI Request Method Logic | All routers — GET, POST, PUT, PATCH, DELETE |
| Move Fast with FastAPI | Project structure, dependency injection, response models |
| Complete RESTful APIs | Full CRUD for Users, Projects, Tasks |
| Setup Database | SQLAlchemy engine, session, Base model (`app/db/database.py`) |
| API Request Methods | Every HTTP method used correctly in routers |
| Authentication & Authorization | JWT login, role-based access (admin vs member) |
| Authenticate Requests | `get_current_user`, `get_current_active_user`, `require_admin` dependencies |
| Large Production Database Setup | MySQL + connection pooling, `.env` config, `check_db_connection` |
| Alembic Data Migration | Two real migrations in `alembic/versions/` |

---

## 🗂 Project Structure

```
taskflow/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         
│   │   │   └── security.py       
│   │   ├── db/
│   │   │   └── database.py       
│   │   ├── models/
│   │   │   ├── user.py           
│   │   │   └── task.py         
│   │   ├── schemas/
│   │   │   ├── user.py          
│   │   │   └── task.py  
│   │   ├── routers/
│   │   │   ├── auth.py        
│   │   │   ├── users.py    
│   │   │   ├── projects.py     
│   │   │   └── tasks.py        
│   │   └── main.py            
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       ├── 001_initial.py   
│   │       └── 002_add_due_date_index.py 
│   ├── alembic.ini
│   ├── seed.py           
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js     
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── components/
    │   │   ├── Layout.jsx    
    │   │   ├── Modal.jsx        
    │   │   └── Toast.jsx       
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx    
    │   │   ├── ProjectsPage.jsx     
    │   │   ├── ProjectDetailPage.jsx  
    │   │   ├── TasksPage.jsx          
    │   │   ├── UsersPage.jsx          
    │   │   └── ProfilePage.jsx     
    │   ├── App.jsx         
    │   ├── main.jsx
    │   └── index.css       
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
CREATE DATABASE taskflow_db;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

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

### 4. Seed Demo Data (Optional)

```bash
cd backend
python seed.py
```

This creates:
- `admin@taskflow.com` / `admin123` (Admin role)
- `alice@taskflow.com` / `alice123` (Member role)
- `bob@taskflow.com` / `bob12345` (Member role)
- 3 projects and 9 tasks

### 5. Start the Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API is now live at:
- **Swagger Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health:** http://localhost:8000/health

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

**users**
```
id | full_name | email | hashed_password | role | is_active | created_at | updated_at
```

**projects**
```
id | name | description | owner_id (FK users) | created_at | updated_at
```

**tasks**
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
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/auth/me` | ✅ | Get my profile |
| POST | `/api/auth/change-password` | ✅ | Change password |

### Projects
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects/` | ✅ | List projects |
| POST | `/api/projects/` | ✅ | Create project |
| GET | `/api/projects/{id}` | ✅ | Get project + tasks |
| PUT | `/api/projects/{id}` | ✅ | Update project |
| DELETE | `/api/projects/{id}` | ✅ | Delete project |

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/tasks/` | ✅ | List tasks (with filters) |
| POST | `/api/tasks/` | ✅ | Create task |
| GET | `/api/tasks/my-tasks` | ✅ | Tasks assigned to me |
| GET | `/api/tasks/{id}` | ✅ | Get single task |
| PATCH | `/api/tasks/{id}` | ✅ | Partial update |
| PUT | `/api/tasks/{id}/status` | ✅ | Quick status change |
| DELETE | `/api/tasks/{id}` | ✅ | Delete task |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/` | ✅ | List users |
| GET | `/api/users/{id}` | ✅ | Get user |
| PUT | `/api/users/{id}` | ✅ | Update user |
| DELETE | `/api/users/{id}` | 🔐 Admin | Delete user |

---

## 💡 Key Learning Points

### Dependency Injection (FastAPI's Superpower)
```python
# Chain dependencies: DB session → validate JWT → check active → check admin
@router.delete("/{id}")
def delete_user(
    id: int,
    db: Session = Depends(get_db),             # Injects DB session
    current_user = Depends(require_admin)       # Injects verified admin user
):
    ...
```

### Why PATCH vs PUT?
- `PUT /tasks/{id}` — Replace the **entire** resource (all fields required)
- `PATCH /tasks/{id}` — Update **only provided fields** (partial update)

### Alembic vs `create_all()`
- `Base.metadata.create_all()` — Simple but can't track changes over time
- Alembic — Version-controlled migrations; run specific up/down; safe in production

---

## 🎯 Next Steps to Extend

- Add task **comments** (new model + router)
- Add **file uploads** for task attachments
- Add **email notifications** with FastAPI BackgroundTasks
- Add **pagination** metadata in list responses
- Add **refresh tokens** for longer sessions
- Deploy backend to **Railway** or **Render**, frontend to **Vercel**
