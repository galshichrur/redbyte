import os
from dotenv import load_dotenv


load_dotenv(".env")

class Config:
    # API
    API_ADDRESS = os.getenv("API_ADDRESS")
    API_PORT = int(os.getenv("API_PORT"))

    # TCP Server

    # Database
    DB_URL = os.getenv("DB_URL")