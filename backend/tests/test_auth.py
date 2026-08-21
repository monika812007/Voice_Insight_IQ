from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pwd = "secretpassword123"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_creation_and_decoding():
    user_id = "user_test_999"
    token = create_access_token(subject=user_id)
    assert token is not None
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == user_id
