from typing import Optional

from sqlmodel import Field, Session, SQLModel, create_engine
from uuid import uuid4

import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv('DATABASE_URL')

class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_name: str = Field(index=True)
    description: str | None = Field(default=None)
    location: str | None = Field(default=None)
    start_date: str = Field(index=True)
    end_date: str = Field(index=True)
    is_active: bool = Field(default=False)
    ticket_price: float
    include_weekends: bool = Field(default=False)

class Speakers(SQLModel, table=True):
    speaker_id: int | None = Field(default=None, primary_key=True)
    fullname: str = Field(index=True)
    description: str = Field(index=True)
    event_id: int = Field(index=True, foreign_key="event.id", ondelete="CASCADE")
    is_moderator: bool = Field(default=False) 

class EventUsers(SQLModel, table=True):
    user_id: int | None = Field(default=None, primary_key=True) 
    firstname: str = Field(index=True)
    lastname: str = Field(index=True)
    phone_number: str = Field(index=True)
    email: str = Field(index=True, exclude=True)
    event_id: int = Field(index=True, foreign_key="event.id", ondelete="CASCADE") 

class EventTickets(SQLModel, table=True):
    ticket_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="eventusers.user_id", index=True, ondelete="CASCADE")
    event_id: int | None = Field(default=None, foreign_key="event.id", index=True, ondelete="SET NULL")
    ticket_price: float = Field(default=0.0)
    qr_code_data: str = Field(unique=True)
    day_length: int = Field(default=1)
    used_times: int = Field(default=0)

class Agenda(SQLModel, table=True):
    agenda_id: int | None = Field(default=None, primary_key=True)
    event_id: int | None = Field(default=None, foreign_key="event.id", ondelete="CASCADE")
    agenda: str | None = Field(default=None, index=True)
    speaker: str | None = Field(default=None)
    location: str | None = Field(default=None, index=True)
    building: str | None = Field(default=None, index=True)
    room: str | None = Field(default=None, index=True)
    date: str | None = Field(default=None, index=True)
    start_time: str | None = Field(default=None)
    end_time: str | None = Field(default=None)

# ==== NO MORE USED ==== #
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    firstname: str = Field(index=True)
    lastname: str = Field(index=True)
    email: str = Field(index=True, unique=True, exclude=True)
    phone_number: str = Field(index=True)
    password: str
    role: str = Field(index=True)

class Banner(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_id: int | None = Field(default=None, foreign_key="event.id", ondelete="CASCADE")
    description: str
    image_url: str | None = Field(default=None)
    is_active: bool = Field(default=False)
    created_at: str

class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    time: str = Field(index=True)
    header: str
    body: str
    staff_only: bool = Field(default=False)

class Ticket(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", index=True, ondelete="CASCADE")
    event_id: int | None = Field(default=None, foreign_key="event.id", index=True, ondelete="SET NULL")
    name: str
    price: float = Field(default=0.0)
    day_length: int
    used_times: int
    qr_code_data: str = Field(unique=True)

class Question(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id", ondelete="CASCADE")
    event_id: int | None = Field(default=None, foreign_key="event.id", ondelete="CASCADE")
    question: str = Field(index=True)
    time: str = Field(index=True)

class MailList(SQLModel, table=True):
    mail_id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(
        default=None, 
        foreign_key="user.id", 
        ondelete="CASCADE"
    )
    email: str = Field(index=True)

class Validation(SQLModel, table=True):
    val_id: int | None = Field(default=None, primary_key=True)
    ticket_uuid: str = Field(index=True)
    user_id: int = Field(index=True, foreign_key="user.id", ondelete="CASCADE")
    validated_user: str = Field(index=True)
    validation_time: str = Field(index=True)

class Transaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key = "user.id", ondelete="CASCADE")
    amount: int = Field(index=True)
    transaction_id: int = Field(index=True)
    created_at: str = Field(index=True)
    description: str = Field(index=True)
    url: str = Field(index=True)
    




engine = create_engine(DB_URL, pool_pre_ping=True, pool_recycle=1800)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    print("Tables created")

def get_session():
    with Session(engine) as session:
        yield session

