from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SolveMate Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "solvemate-super-secret-jwt-key-2026-production-ready-32bytes"
    REFRESH_SECRET_KEY: str = "solvemate-super-secret-refresh-key-2026-production-ready"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    # Defaults to SQLite async if PostgreSQL is not yet initialized or for quick dev/test
    DATABASE_URL: str = "sqlite+aiosqlite:///./solvemate.db"
    POSTGRES_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/solvemate"
    
    # Financial constants
    PLATFORM_FEE_PERCENTAGE: float = 0.10  # 10%
    GST_PERCENTAGE: float = 0.18  # 18% on platform fee
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
