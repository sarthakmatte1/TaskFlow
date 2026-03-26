from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the SQLAlchemy engine
# pool_pre_ping=True checks connections before using them (handles dropped connections)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,  # Recycle connections every hour
    echo=settings.DEBUG  # Log SQL queries in debug mode
)

# SessionLocal: each instance is a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()

print("DATABASE_URL:", settings.DATABASE_URL)


def get_db():
    """
    FastAPI Dependency: Yields a database session.
    Automatically closes the session when the request is done.
    Usage: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in ORM models."""
    Base.metadata.create_all(bind=engine)


def check_db_connection():
    """Health check: verify DB connection is alive."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"DB connection error: {e}")
        return False
