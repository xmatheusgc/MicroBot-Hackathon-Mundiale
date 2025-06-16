from sqlalchemy.orm import declarative_base
from pydantic import BaseModel

Base = declarative_base()

class CloseChatRequest(BaseModel):
    chatId: str