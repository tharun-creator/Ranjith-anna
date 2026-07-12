import asyncio
import os
import logging
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Load environment variables
load_dotenv()

# Add parent dir to path so we can import app modules if needed
import sys
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.services.storage import get_storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migrate_storage")

async def main():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL is not set.")
        return

    storage = get_storage()
    logger.info(f"Initialized storage provider: {storage.__class__.__name__}")

    # Local path where existing PDFs are stored
    local_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "invoices"))
    if not os.path.exists(local_dir):
        logger.info(f"Local storage directory {local_dir} does not exist. Nothing to migrate.")
        return

    engine = create_async_engine(database_url)
    async with engine.begin() as conn:
        # Fetch all attachments that have a storage path
        result = await conn.execute(text("SELECT id, storage_path, filename FROM attachments WHERE storage_path IS NOT NULL;"))
        attachments = result.all()
        logger.info(f"Found {len(attachments)} attachment records in the database.")

        migrated_count = 0
        for row in attachments:
            att_id, db_storage_path, filename = row
            
            # The current storage_path in DB might be a full path or a relative filename
            filename_key = os.path.basename(db_storage_path)
            local_file_path = os.path.join(local_dir, filename_key)
            
            # If the file exists locally, upload it
            if os.path.exists(local_file_path):
                logger.info(f"Migrating local file {filename_key} for attachment {att_id}...")
                with open(local_file_path, "rb") as f:
                    file_bytes = f.read()
                
                # Save to configured storage backend (could be local or cloud)
                # It returns the key (which will be filename_key)
                new_key = storage.save(file_bytes, filename_key, "application/pdf")
                
                # Update DB storage path to contain the clean storage key
                await conn.execute(
                    text("UPDATE attachments SET storage_path = :new_key WHERE id = :id;"),
                    {"new_key": new_key, "id": att_id}
                )
                migrated_count += 1
            else:
                logger.warning(f"Local file not found for attachment {att_id} at {local_file_path}. Skipping.")
                
        logger.info(f"Successfully migrated {migrated_count} files.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
