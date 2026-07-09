import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api import invoices, auth

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", '["*"]')
try:
    allowed_origins = json.loads(allowed_origins_raw)
    if not isinstance(allowed_origins, list):
        allowed_origins = [allowed_origins_raw]
except Exception:
    allowed_origins = [allowed_origins_raw]

app = FastAPI(title="Invoice Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Invoice Intelligence API"}

from fastapi import Request, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

@app.get("/v1/gmail/callback")
async def gmail_callback_alias(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    # Alias to match the GOOGLE_REDIRECT_URI configured in the user's Google Cloud Console
    return await auth.google_callback(
        request=request,
        background_tasks=background_tasks,
        db=db
    )

app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["Invoices"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
