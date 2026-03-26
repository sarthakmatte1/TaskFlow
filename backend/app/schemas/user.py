from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────────────────

class UserCreate(BaseModel):
    """Schema for registering a new user."""
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "member"

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ["admin", "member"]:
            raise ValueError("Role must be 'admin' or 'member'")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class ChangePassword(BaseModel):
    """Schema for changing password (requires old password)."""
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_strength(cls, v):
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v


# ── Response Schemas ─────────────────────────────────────────────────

class UserResponse(BaseModel):
    """Safe user response (never exposes hashed_password)."""
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Auth Schemas ─────────────────────────────────────────────────────

class Token(BaseModel):
    """JWT token response returned on login."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Payload decoded from JWT token."""
    email: Optional[str] = None
