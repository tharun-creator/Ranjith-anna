import os
from dotenv import load_dotenv

# Load env variables first
load_dotenv()

import socket

# Globally patch socket.getaddrinfo to force IPv4 only when running on Render or when forced.
# This prevents OSError: [Errno 101] Network is unreachable on Render,
# which lacks outbound IPv6 support but resolves hosts (Google & PostgreSQL) to IPv6 addresses.
if os.getenv("RENDER") == "true" or os.getenv("FORCE_IPV4") == "true":
    orig_getaddrinfo = socket.getaddrinfo
    def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        # Force family to IPv4 (AF_INET) to prevent any attempt at resolving/routing via IPv6
        forced_family = socket.AF_INET
        try:
            return orig_getaddrinfo(host, port, forced_family, type, proto, flags)
        except Exception:
            return orig_getaddrinfo(host, port, family, type, proto, flags)
    socket.getaddrinfo = patched_getaddrinfo


import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import invoices, auth

allowed_origins_raw = os.getenv("ALLOWED_ORIGINS")
app_env = os.getenv("APP_ENV", "production").lower()

if not allowed_origins_raw:
    if app_env == "development":
        allowed_origins = ["*"]
    else:
        raise ValueError("ALLOWED_ORIGINS environment variable is not configured in production.")
else:
    try:
        allowed_origins = json.loads(allowed_origins_raw)
        if not isinstance(allowed_origins, list):
            allowed_origins = [allowed_origins_raw]
    except Exception as e:
        if app_env == "development":
            allowed_origins = ["*"]
        else:
            raise ValueError(f"Failed to parse ALLOWED_ORIGINS: {e}")

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
