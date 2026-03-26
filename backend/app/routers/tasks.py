from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.task import Task, Project
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.core.security import get_current_active_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new task.
    - Validates the project exists and belongs to current user
    - Sets current user as owner
    - Validates assignee exists if provided
    """
    # Verify project exists and user has access
    project = db.query(Project).filter(Project.id == task_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot add task to this project")

    # Validate assignee if provided
    if task_data.assignee_id:
        assignee = db.query(User).filter(User.id == task_data.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee user not found")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        priority=task_data.priority,
        project_id=task_data.project_id,
        owner_id=current_user.id,
        assignee_id=task_data.assignee_id,
        due_date=task_data.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = Query(None, description="Filter by status: todo, in_progress, done"),
    priority: Optional[str] = Query(None, description="Filter by priority: low, medium, high"),
    project_id: Optional[int] = Query(None, description="Filter by project"),
    assignee_id: Optional[int] = Query(None, description="Filter by assignee"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List tasks with optional filters.
    - Filter by status, priority, project_id, assignee_id
    - Admins see all tasks; members see tasks in their projects or assigned to them
    """
    query = db.query(Task)

    # Access control
    if current_user.role != "admin":
        # Members see tasks they own or are assigned to
        query = query.filter(
            (Task.owner_id == current_user.id) | (Task.assignee_id == current_user.id)
        )

    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    tasks = query.offset(skip).limit(limit).all()
    return tasks


@router.get("/my-tasks", response_model=List[TaskResponse])
def get_my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get tasks assigned to the currently logged-in user."""
    tasks = db.query(Task).filter(Task.assignee_id == current_user.id).all()
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a single task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check access
    if (task.owner_id != current_user.id and
        task.assignee_id != current_user.id and
        current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    update_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Partially update a task (PATCH).
    - Only updates fields that are provided
    - Owner or assignee or admin can update
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if (task.owner_id != current_user.id and
        task.assignee_id != current_user.id and
        current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    # If new assignee provided, validate they exist
    if update_data.assignee_id is not None:
        assignee = db.query(User).filter(User.id == update_data.assignee_id).first()
        if not assignee:
            raise HTTPException(status_code=404, detail="Assignee not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    new_status: str = Query(..., description="New status: todo, in_progress, done"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Quick status update endpoint.
    - Convenient for Kanban-style drag-and-drop status changes
    """
    valid_statuses = ["todo", "in_progress", "done"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {valid_statuses}"
        )

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if (task.owner_id != current_user.id and
        task.assignee_id != current_user.id and
        current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Access denied")

    task.status = new_status
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a task (owner or admin only)."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    db.delete(task)
    db.commit()
