from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import create_tables, check_db_connection
from app.routers import auth, users, tasks, projects

# ── App Initialization ───────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    description="""
## TaskFlow API 🚀

A full-featured Task Management REST API built with FastAPI + MySQL.

### Features
- **JWT Authentication** — Secure login with Bearer tokens
- **Role-Based Authorization** — Admin vs Member access levels
- **Projects** — Organize tasks into projects
- **Tasks** — Full CRUD with filtering, status updates, assignees
- **Alembic Migrations** — Database version control

### Authentication
1. Register via `POST /api/auth/register`
2. Login via `POST /api/auth/login` to get your JWT token
3. Click **Authorize** button above and paste the token
4. All protected endpoints will now work
    """,
    version="1.0.0",
    debug=settings.DEBUG,
)

# ── CORS Middleware ──────────────────────────────────────────────────
# Allows the React frontend to call this API from a different origin

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)

# ── Startup Event ─────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """
    Runs when the FastAPI server starts.
    - Creates all DB tables if they don't exist
    - Checks DB connection
    """
    print("🚀 TaskFlow API starting up...")
    create_tables()
    if check_db_connection():
        print("✅ Database connected successfully")
    else:
        print("❌ Database connection failed — check your DATABASE_URL in .env")


# ── Root & Health Endpoints ───────────────────────────────────────────

@app.get("/", tags=["Root"])
def root():
    """Root endpoint — confirms the API is running."""
    return {
        "message": "Welcome to TaskFlow API!",
        "docs": "/docs",
        "redoc": "/redoc",
        "version": "1.0.0"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint — useful for deployment monitoring."""
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "app": settings.APP_NAME
    }
