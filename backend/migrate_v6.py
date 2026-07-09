import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Load environment variables from the backend directory
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(dotenv_path)

async def main():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is not set.")
        return

    engine = create_async_engine(database_url)
    async with engine.begin() as conn:
        try:
            print("Adding user_id column to gmail_connections...")
            await conn.execute(text("""
                ALTER TABLE gmail_connections
                ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
            """))
            print("Successfully added gmail_connections.user_id.")
            print("Migration completed successfully.")

        except Exception as e:
            print(f"Error executing migration DDL: {e}")
            import traceback
            traceback.print_exc()

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
