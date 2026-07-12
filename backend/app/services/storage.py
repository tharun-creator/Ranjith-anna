import os
import logging
from typing import Protocol, Union
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class FileStorage(Protocol):
    def save(self, file_bytes: bytes, key: str, mime_type: str = "application/pdf") -> str:
        """Saves file bytes to the storage backend and returns a reference key or URL."""
        ...

    def get_url(self, key: str) -> str:
        """Returns a direct or presigned URL to retrieve the file."""
        ...

    def delete(self, key: str) -> None:
        """Deletes the file from the storage backend."""
        ...


class LocalFileStorage:
    def __init__(self, base_dir: str = None, base_url: str = None):
        # Default to data/invoices in the backend directory
        if base_dir is None:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "invoices"))
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)
        
        # Base URL for public links (can point to our API gateway)
        self.base_url = base_url or os.getenv("API_BASE_URL", "http://localhost:8000")

    def save(self, file_bytes: bytes, key: str, mime_type: str = "application/pdf") -> str:
        file_path = os.path.join(self.base_dir, key)
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        return key

    def get_url(self, key: str) -> str:
        # Returns a route managed by our FastAPI app
        return f"{self.base_url}/api/v1/invoices/attachments/{key}"

    def delete(self, key: str) -> None:
        file_path = os.path.join(self.base_dir, key)
        if os.path.exists(file_path):
            os.remove(file_path)


class S3FileStorage:
    def __init__(self):
        self.bucket_name = os.getenv("S3_BUCKET_NAME")
        self.aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.region_name = os.getenv("AWS_REGION", "us-east-1")
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL")  # Useful for Supabase/MinIO
        
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.region_name,
            endpoint_url=self.endpoint_url
        )

    def save(self, file_bytes: bytes, key: str, mime_type: str = "application/pdf") -> str:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_bytes,
                ContentType=mime_type
            )
            return key
        except ClientError as e:
            logger.error(f"S3 save failed for key {key}: {e}")
            raise HTTPException(status_code=500, detail=f"S3 Storage upload failed: {e}")

    def get_url(self, key: str) -> str:
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=3600  # 1 hour
            )
            return url
        except ClientError as e:
            logger.error(f"S3 generate presigned URL failed for key {key}: {e}")
            return ""

    def delete(self, key: str) -> None:
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
        except ClientError as e:
            logger.error(f"S3 delete failed for key {key}: {e}")


def get_storage() -> FileStorage:
    backend_type = os.getenv("STORAGE_BACKEND", "local").lower()
    if backend_type == "s3":
        return S3FileStorage()
    return LocalFileStorage()
