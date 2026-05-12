from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select

import os
from dotenv import load_dotenv

load_dotenv()
DB_NAME = os.getenv('DATABASE_NAME')
print(f'db name: {DB_NAME}')

class Attendee(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    firstname: str = Field(index=True)
    lastname: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    role: str = Field(index=True)

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    attendee_id: int | None = Field(default=None, foreign_key="attendee.id")
    username: str = Field(unique=True)
    password: str 

class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    date: str | None = Field(index=True)
    start_time: str | None = Field(index=True)
    end_time: str | None = Field(index=True)
    topic: str | None=Field(index=True)
    speaker: int | None = Field(index=True, foreign_key="attendee.id")
    location: str | None = Field(index=True)
    building: str | None = Field(index=True)
    room: str | None = Field(index=True)

connect_args = {"check_same_thread": False}
engine = create_engine(DB_NAME, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session