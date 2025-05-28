from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    folders = relationship("Folder", back_populates="user", cascade="all, delete")

class Folder(Base):
    __tablename__ = 'folders'
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'))
    user = relationship("User", back_populates="folders")
    photos = relationship("Photo", back_populates="folder", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = 'photos'

    id = Column(Integer, primary_key=True, index=True)
    classification_result = Column(String, nullable=False)
    folder_id = Column(Integer, ForeignKey('folders.id', ondelete="CASCADE"), nullable=False)
    url = Column(String, nullable=False)

    folder = relationship("Folder", back_populates="photos")
