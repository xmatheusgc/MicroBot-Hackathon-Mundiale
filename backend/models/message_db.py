from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class MessageDB(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey("chats.id"))
    role = Column(String)
    text = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    chat = relationship("ChatDB", back_populates="messages")