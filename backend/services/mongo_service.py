# backend/services/mongo_service.py
"""MongoDB connection helper.
Provides a simple function to obtain a collection from the configured database.
"""

from pymongo import MongoClient
from backend.config import Config

_client = MongoClient(Config.MONGO_URI)
_db = _client[Config.MONGO_DB_NAME]

def get_collection(name):
    """Return a MongoDB collection.
    Args:
        name (str): collection name.
    Returns:
        pymongo.collection.Collection
    """
    return _db[name]
