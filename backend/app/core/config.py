from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:newpassword@localhost:3306/taskflow_db"

    # JWT
    SECRET_KEY: str = "hVPTNh9RTSlYLU9TPYZCUz+U1t78yDoh/I5eJ3jqwuM="
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_NAME: str = "TaskFlow API"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
