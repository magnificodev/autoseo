from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    project_name: str = "Autoseo Backend"
    backend_cors_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


