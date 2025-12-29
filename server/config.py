import os
from dotenv import load_dotenv


load_dotenv(".env")

class Config:
    # API
    API_ADDRESS = os.getenv("API_ADDRESS")
    API_PORT = int(os.getenv("API_PORT"))

    # Auth
    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
    JWT_EXPIRE_SECONDS = int(os.getenv("JWT_EXPIRE_SECONDS"))

    # Endpoints
    ENROLLMENT_TOKEN_EXPIRE_SECONDS = int(os.getenv("ENROLLMENT_TOKEN_EXPIRE_SECONDS"))
    # TCP Server

    # Database
    DB_URL = os.getenv("DB_URL")