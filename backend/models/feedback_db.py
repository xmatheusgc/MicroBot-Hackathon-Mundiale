from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base

class FeedbackDB(Base):
    __tablename__ = "feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String, ForeignKey("chats.id"))
    rating = Column(Integer)
    comment = Column(String, nullable=True)

    chat = relationship("ChatDB", back_populates="feedbacks")