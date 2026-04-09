from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "HumanSense AI"
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "humansense_ai"
    redis_url: str = "redis://localhost:6379/0"
    allowed_origins: str = "http://localhost:5173,http://localhost:5174"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
