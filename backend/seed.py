"""
seed.py — Populate the database with demo data for development.
Run with: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, create_tables
from app.models.user import User
from app.models.task import Project, Task
from app.core.security import get_password_hash


def seed():
    create_tables()
    db = SessionLocal()

    try:
        # Skip if data already exists
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("🌱 Seeding database...")

        # ── Create Users ──────────────────────────────────────────────
        admin = User(
            full_name="Admin User",
            email="admin@taskflow.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
        )
        alice = User(
            full_name="Alice Johnson",
            email="alice@taskflow.com",
            hashed_password=get_password_hash("alice123"),
            role="member",
        )
        bob = User(
            full_name="Bob Smith",
            email="bob@taskflow.com",
            hashed_password=get_password_hash("bob12345"),
            role="member",
        )
        db.add_all([admin, alice, bob])
        db.commit()
        db.refresh(admin)
        db.refresh(alice)
        db.refresh(bob)
        print(f"  ✅ Created users: admin, alice, bob")

        # ── Create Projects ───────────────────────────────────────────
        p1 = Project(name="Website Redesign", description="Redesign the company website", owner_id=alice.id)
        p2 = Project(name="API Integration", description="Integrate third-party payment API", owner_id=bob.id)
        p3 = Project(name="Mobile App", description="Build the iOS/Android app", owner_id=admin.id)
        db.add_all([p1, p2, p3])
        db.commit()
        db.refresh(p1)
        db.refresh(p2)
        db.refresh(p3)
        print(f"  ✅ Created 3 projects")

        # ── Create Tasks ──────────────────────────────────────────────
        tasks = [
            Task(title="Design homepage mockup", status="done", priority="high",
                 project_id=p1.id, owner_id=alice.id, assignee_id=alice.id),
            Task(title="Write content for About page", status="in_progress", priority="medium",
                 project_id=p1.id, owner_id=alice.id, assignee_id=bob.id),
            Task(title="Setup CI/CD pipeline", status="todo", priority="high",
                 project_id=p1.id, owner_id=alice.id, assignee_id=bob.id),
            Task(title="Integrate Stripe payment", status="in_progress", priority="high",
                 project_id=p2.id, owner_id=bob.id, assignee_id=bob.id),
            Task(title="Write API documentation", status="todo", priority="low",
                 project_id=p2.id, owner_id=bob.id, assignee_id=alice.id),
            Task(title="Set up webhook handlers", status="todo", priority="medium",
                 project_id=p2.id, owner_id=bob.id, assignee_id=bob.id),
            Task(title="Design onboarding flow", status="done", priority="high",
                 project_id=p3.id, owner_id=admin.id, assignee_id=alice.id),
            Task(title="Implement push notifications", status="in_progress", priority="medium",
                 project_id=p3.id, owner_id=admin.id, assignee_id=bob.id),
            Task(title="App store submission", status="todo", priority="high",
                 project_id=p3.id, owner_id=admin.id, assignee_id=admin.id),
        ]
        db.add_all(tasks)
        db.commit()
        print(f"  ✅ Created {len(tasks)} tasks")

        print("\n🎉 Seed complete!")
        print("\n📋 Login credentials:")
        print("  Admin  → admin@taskflow.com / admin123")
        print("  Alice  → alice@taskflow.com / alice123")
        print("  Bob    → bob@taskflow.com   / bob12345")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
