from fastapi import APIRouter, HTTPException, status, Depends
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User
from models.user_db import UserDB
import os

SECRET_KEY = os.getenv("SECRET_KEY", "sua_chave_secreta")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: User, db: Session = Depends(get_db)):
    if db.query(UserDB).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    if db.query(UserDB).filter_by(email=user.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    hashed_password = pwd_context.hash(user.password)
    db_user = UserDB(
        username=user.username,
        email=user.email,
        password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"[REGISTRO] Usuário registrado com sucesso: username={db_user.username}, email={db_user.email}, role={db_user.role}")
    return {"msg": "Usuário registrado com sucesso"}

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter_by(username=user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    print(f"[LOGIN] Login realizado com sucesso: username={db_user.username}, email={db_user.email}, role={db_user.role}")
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}