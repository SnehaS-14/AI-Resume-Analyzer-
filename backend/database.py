import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    try:
        client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
        await client.admin.command("ping")
        print("[SUCCESS] MongoDB connected successfully")
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        raise


async def close_db():
    global client
    if client:
        client.close()
        print("[SUCCESS] MongoDB connection closed")


def get_collection(collection_name: str = "analyses"):
    global client
    if client is None:
        raise RuntimeError("Database not initialized. Ensure connect_db() was called during startup.")
    return client["resume_analyzer"][collection_name]
