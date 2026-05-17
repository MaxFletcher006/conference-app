from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine
from uuid import uuid4

import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv('DATABASE_URL')

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    firstname: str = Field(index=True)
    lastname: str = Field(index=True)
    email: str = Field(index=True, unique=True, exclude=True)
    phone_number: str = Field(index=True)
    password: str 
    role: str = Field(index=True)

class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: str | None = Field(index=True)
    start_time: str | None = Field(index=True)
    end_time: str | None = Field(index=True)
    topic: str | None=Field(index=True)
    agenda: str | None=Field(default=None, index=True)
    speaker: str | None = Field(index=True)
    location: str | None = Field(index=True)
    building: str | None = Field(index=True)
    room: str | None = Field(index=True)

'''
class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    time: str = Field(index=True)
    header: str
    body: str 
'''

class Ticket(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True)
    name: str
    day_length: int 
    used_times: int 
    qr_code_data: str = Field(unique=True)

class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    event_id: int | None = Field(default=None, foreign_key="event.id")
    question: str = Field(index=True)
    time: str = Field(index=True)

class MailList(SQLModel, table=True):
    mail_id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(
        default=None, 
        foreign_key="user.id", 
    )
    
    email: str = Field(index=True)

engine = create_engine(DB_URL)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("Tables created")

def get_session():
    with Session(engine) as session:
        yield session

