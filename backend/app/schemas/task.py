from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


# ── Project Schemas ───────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    owner_id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ProjectDetail(ProjectResponse):
    """Project with its tasks included."""
    tasks: List["TaskResponse"] = []


# ── Task Schemas ─────────────────────────────────────────────────────

VALID_STATUSES = ["todo", "in_progress", "done"]
VALID_PRIORITIES = ["low", "medium", "high"]


class TaskCreate(BaseModel):
    """Schema for creating a task."""
    title: str
    description: Optional[str] = None
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    project_id: int
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of {VALID_PRIORITIES}")
        return v


class TaskUpdate(BaseModel):
    """Schema for partial task update (PATCH)."""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v is not None and v not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of {VALID_PRIORITIES}")
        return v


class TaskResponse(BaseModel):
    """Full task response schema."""
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    project_id: int
    owner_id: Optional[int] = None
    assignee_id: Optional[int] = None
    due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TaskFilter(BaseModel):
    """Query parameters for filtering tasks."""
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None


# Resolve forward refs
ProjectDetail.model_rebuild()
