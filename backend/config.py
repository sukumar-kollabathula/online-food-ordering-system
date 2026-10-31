import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "food_ordering_db")
    CASS_CONTACT_POINTS = [h.strip() for h in os.getenv("CASS_CONTACT_POINTS", "127.0.0.1").split(",") if h.strip()]
    CASS_PORT = int(os.getenv("CASS_PORT", "9042"))
    CASS_KEYSPACE = os.getenv("CASS_KEYSPACE", "food_ordering")
    CASS_USERNAME = os.getenv("CASS_USERNAME") or None
    CASS_PASSWORD = os.getenv("CASS_PASSWORD") or None
