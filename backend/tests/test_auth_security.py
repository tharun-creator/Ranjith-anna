import pytest
import jwt
from datetime import datetime, timedelta, timezone
from app.auth_utils import create_access_token, decode_access_token, JWT_PRIVATE_KEY, JWT_ALGORITHM

def test_jwt_valid_iss_and_aud():
    token = create_access_token("user_123")
    payload = decode_access_token(token)
    assert payload["sub"] == "user_123"
    assert payload["iss"] == "finnex-app"
    assert payload["aud"] == "finnex-users"

def test_jwt_invalid_issuer():
    now = datetime.now(timezone.utc)
    invalid_payload = {
        "sub": "user_123",
        "iat": now,
        "exp": now + timedelta(days=1),
        "iss": "hacker-app",  # Wrong issuer
        "aud": "finnex-users"
    }
    invalid_token = jwt.encode(invalid_payload, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM)
    with pytest.raises(jwt.InvalidIssuerError):
        decode_access_token(invalid_token)

def test_jwt_invalid_audience():
    now = datetime.now(timezone.utc)
    invalid_payload = {
        "sub": "user_123",
        "iat": now,
        "exp": now + timedelta(days=1),
        "iss": "finnex-app",
        "aud": "hacker-audience"  # Wrong audience
    }
    invalid_token = jwt.encode(invalid_payload, JWT_PRIVATE_KEY, algorithm=JWT_ALGORITHM)
    with pytest.raises(jwt.InvalidAudienceError):
        decode_access_token(invalid_token)
