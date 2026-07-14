from dotenv import load_dotenv
load_dotenv()

import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import Base
# Import all models to register them on Base.metadata
from app.models import Organization, User, GmailConnection, EmailRecord, Invoice, Attachment, FinancialEvent, LedgerMaster

async def main():
    db_url = os.getenv("DATABASE_URL", "").strip()
    if not db_url:
        print("DATABASE_URL is not set in the environment variables.")
        return
        
    print(f"Connecting to database to initialize tables...")
    engine = create_async_engine(db_url)
    
    # Run the creation
    async with engine.begin() as conn:
        # Create all tables in the database
        print("Creating tables in Supabase...")
        await conn.run_sync(Base.metadata.create_all)
        print("All tables successfully created in Supabase database!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
