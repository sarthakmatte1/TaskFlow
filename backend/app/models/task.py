from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class Project(Base):
    """
    Projects table.
    - Groups tasks together
    - Owned by a user
    """
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project id={self.id} name={self.name}>"


class Task(Base):
    """
    Tasks table.
    - Core entity of the app
    - Belongs to a project
    - Has an owner (creator) and optional assignee
    - Priority: low, medium, high
    - Status: todo, in_progress, done
    """
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    # Status & Priority
    status = Column(String(20), default="todo", nullable=False)       # todo | in_progress | done
    priority = Column(String(10), default="medium", nullable=False)   # low | medium | high

    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Optional due date
    due_date = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="tasks")
    owner = relationship("User", back_populates="tasks", foreign_keys=[owner_id])
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assignee_id])

    def __repr__(self):
        return f"<Task id={self.id} title={self.title} status={self.status}>"