from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import hashlib
import secrets
from database import get_collection

router = APIRouter()

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user_id: str
    email: str
    name: str
    message: str

def hash_password(password: str) -> str:
    salt = secrets.token_hex(32)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${hashed.hex()}"

def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, hash_hex = hashed.split('$')
        hashed_check = hashlib.pbkdf2_hmac('sha256', plain.encode(), salt.encode(), 100000)
        return hashed_check.hex() == hash_hex
    except ValueError:
        return False

@router.post("/auth/signup")
async def signup(request: SignupRequest):
    """Register a new user"""
    users_collection = get_collection("users")

    # Check if user already exists
    existing = await users_collection.find_one({"email": request.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = {
        "email": request.email.lower(),
        "name": request.name,
        "password_hash": hash_password(request.password),
        "created_at": None
    }

    result = await users_collection.insert_one(user)

    return AuthResponse(
        user_id=str(result.inserted_id),
        email=request.email,
        name=request.name,
        message="Signup successful"
    )

@router.post("/auth/login")
async def login(request: LoginRequest):
    """Login user"""
    users_collection = get_collection("users")

    # Find user
    user = await users_collection.find_one({"email": request.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        user_id=str(user["_id"]),
        email=user["email"],
        name=user["name"],
        message="Login successful"
    )
