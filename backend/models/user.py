from pydantic import BaseModel, EmailStr, constr
from typing import Literal

class User(BaseModel):
    username: str
    email: EmailStr
    password: constr(min_length=6)
    role: Literal["admin", "funcionario", "usuario"] = "usuario"