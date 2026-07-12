import os
import pytest
from dotenv import load_dotenv

# Force loading of the .env file from the backend folder before any app modules are imported
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
load_dotenv(dotenv_path)

# Provide a fallback dummy DATABASE_URL if none exists to avoid SQLAlchemy instantiation crashes during test collection
if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

# Make sure anyio/pytest-asyncio plugin is configured
@pytest.fixture
def anyio_backend():
    return "asyncio"
