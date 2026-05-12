from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import select, Session
from typing import Annotated
from contextlib import asynccontextmanager

from models.model import Attendee, User, Event, create_db_and_tables, get_session
from models.base_model import AttendeeModel, UserModel, EventModel

@asynccontextmanager

async def lifespan(app: FastAPI):
    print("Startup: Connecting to database...")
    create_db_and_tables()
    yield
    print("Shutting down: Closing database connection")

app = FastAPI(lifespan=lifespan)
SessionDep = Annotated[Session, Depends(get_session)]

@app.get("/")
def greetings():
    return {"message": "Server started"}

# --- 1. ATTENDEE CRUD ---

@app.get("/attendees", response_model=list[Attendee])
def get_attendees(session: SessionDep):
    return session.exec(select(Attendee)).all()

@app.get("/attendee/{attendee_id}", response_model=Attendee)
def get_attendee(attendee_id: int, session: SessionDep):
    attendee = session.get(Attendee, attendee_id)
    if not attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
    return attendee

@app.post("/attendee")
def add_attendee(attendee: AttendeeModel, session: SessionDep):
    db_attendee = Attendee.model_validate(attendee)
    try:
        session.add(db_attendee)
        session.commit()
        session.refresh(db_attendee)
        return {"status": True, "data": db_attendee}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/attendee/{attendee_id}")
def update_attendee(attendee_id: int, attendee_data: AttendeeModel, session: SessionDep):
    db_attendee = session.get(Attendee, attendee_id)
    if not db_attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
    
    # Өгөгдлийг шинэчлэх
    data = attendee_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_attendee, key, value)
        
    session.add(db_attendee)
    session.commit()
    session.refresh(db_attendee)
    return {"status": True, "data": db_attendee}

@app.delete("/attendee/{attendee_id}")
def delete_attendee(attendee_id: int, session: SessionDep):
    attendee = session.get(Attendee, attendee_id)
    if not attendee:
        raise HTTPException(status_code=404, detail="Attendee not found")
    session.delete(attendee)
    session.commit()
    return {"status": True, "message": "Attendee deleted"}

# --- 2. USER CRUD ---

@app.post("/user")
def create_user(user: UserModel, session: SessionDep):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.get("/users", response_model=list[User])
def read_users(session: SessionDep):
    return session.exec(select(User)).all()

# --- 3. EVENT CRUD ---

@app.get("/events", response_model=list[Event])
def get_events(session: SessionDep):
    return session.exec(select(Event)).all()

@app.post("/event")
def create_event(event: EventModel, session: SessionDep):
    db_event = Event.model_validate(event)
    try:
        session.add(db_event)
        session.commit()
        session.refresh(db_event)
        return db_event
    except Exception:
        session.rollback()
        raise HTTPException(status_code=400, detail="Event creation failed. Check speaker_id.")

@app.put("/event/{event_id}")
def update_event(event_id: int, event_data: EventModel, session: SessionDep):
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    data = event_data.model_dump()
    for key, value in data.items():
        setattr(db_event, key, value)
        
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event

@app.delete("/event/{event_id}")
def delete_event(event_id: int, session: SessionDep):
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    session.delete(db_event)
    session.commit()
    return {"status": True, "message": "Event deleted"}