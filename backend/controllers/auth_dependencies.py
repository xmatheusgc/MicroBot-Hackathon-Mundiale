from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from database import SessionLocal
from models.user_db import UserDB
from controllers.auth_controller import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        db = SessionLocal()
        user = db.query(UserDB).filter_by(username=username).first()
        db.close()
        if user is None:
            raise credentials_exception
        return {
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    except JWTError:
        raise credentials_exception

def require_role(required_role: str):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] != required_role:
            raise HTTPException(status_code=403, detail="Acesso negado")
        return user
    return role_checker