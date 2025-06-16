from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from models.base import Base

class ChatDB(Base):
    __tablename__ = "chats"
    id = Column(String, primary_key=True, index=True) 
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String, nullable=False)
    last_message = Column(String)
    last_message_time = Column(DateTime, default=datetime.utcnow)
    online = Column(Boolean, default=True)
    closed = Column(Boolean, default=False)

    user = relationship("UserDB", back_populates="chats")
    messages = relationship("MessageDB", back_populates="chat")
    feedbacks = relationship("FeedbackDB", back_populates="chat")