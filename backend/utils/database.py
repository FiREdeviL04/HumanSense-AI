from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings


class Mongo:
    client: AsyncIOMotorClient | None = None


mongo = Mongo()


def get_db():
    if mongo.client is None:
        raise RuntimeError("Database client is not initialized")
    return mongo.client[settings.mongo_db]
