from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import select, Session
from typing import Annotated, List
from contextlib import asynccontextmanager
from sqlalchemy.exc import IntegrityError

from models.model import User, Event, Post, Ticket, Question, create_db_and_tables, get_session
from models.base_model import UserModel, EventModel, PostModel, UserReturn, QuestionModel

import bcrypt

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
SessionDep = Annotated[Session, Depends(get_session)]

@app.get("/")
def greetings():
    return {"message": "Server started"}

# ---- USER FUNCTIONS ---- #

@app.get("/all-users", response_model=List[UserReturn])
def get_all_users(session: SessionDep):
    try:
        users = session.exec(select(User)).all()
        return users

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/user/{id}", response_model=UserReturn)
def get_user(session: SessionDep, id: int):
    try:
        user = session.get(User, id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.post("/register", response_model=UserReturn)
def create_user(session: SessionDep, new_user: UserModel):

    db_user = User.model_validate(new_user)

    hashed_password = bcrypt.hashpw(
        new_user.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    db_user.password = hashed_password.decode("utf-8")

    try:
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        return db_user

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=409,
            detail="User already registered"
        )

    except Exception as e:
        session.rollback()
        print(f"Error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Error occurred while adding user"
        )


@app.post("/login", response_model=UserReturn)
def login_user(session: SessionDep, email: str, password: str):
    try:
        db_user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if not db_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        password_match = bcrypt.checkpw(
            password.encode("utf-8"),
            db_user.password.encode("utf-8")
        )

        if not password_match:
            raise HTTPException(
                status_code=401,
                detail="Email or password doesn't match"
            )

        return db_user

    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@app.put("/user/{id}", response_model=UserReturn)
def update_user(session: SessionDep, id: int, current_user: UserModel):

    try:
        user = session.get(User, id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        data = current_user.model_dump(exclude_unset=True)
        if "password" in data:
            hashed_password = bcrypt.hashpw(
                data["password"].encode("utf-8"),
                bcrypt.gensalt()
            )

            data["password"] = hashed_password.decode("utf-8")

        for key, value in data.items():
            setattr(user, key, value)

        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    
    except HTTPException:
        raise

    except Exception as e:
        session.rollback()

        print(f"Error: {e}")

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@app.delete("/user/{id}")
def delete_user(session: SessionDep, id: int):

    try:
        user = session.get(User, id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        session.delete(user)
        session.commit()
        return {
            "message": "User deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
    
# ---- EVENT FUNCTIONS ---- #

@app.get("/all-events", response_model=List[Event])
def get_events(session: SessionDep):
    try:
        return session.exec(select(Event)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/event/{id}", response_model=Event)
def get_event(session: SessionDep, id: int):
    try:
        db_event = session.get(Event, id)
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
        
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@app.post("/add-event", response_model=Event)
def create_event(event: EventModel, session: SessionDep):
    db_event = Event.model_validate(event)
    try:
        session.add(db_event)
        session.commit()
        session.refresh(db_event)
        return db_event
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=400, detail="Event creation failed.")

@app.put("/event/{event_id}", response_model=Event)
def update_event(event_id: int, event_data: EventModel, session: SessionDep):
    try:
        db_event = session.get(Event, event_id)
        if not db_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        data = event_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(db_event, key, value)
            
        session.add(db_event)
        session.commit()
        session.refresh(db_event)
        return db_event
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/event/{event_id}")
def delete_event(event_id: int, session: SessionDep):
    try: 
        db_event = session.get(Event, event_id)
        if not db_event:
            raise HTTPException(status_code=404, detail="Event not found")
        session.delete(db_event)
        session.commit()
        return {"status": True, "message": "Event deleted"}
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
# ---- POST FUNCTIONS ---- #

@app.get("all-posts", response_model=List[PostModel])
def get_all_post(session: SessionDep):
    try:
        return session.exec(select(Post)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
# ---- QUESTION FUNCTIONS ---- #
@app.get("all-questions", response_model=List[QuestionModel])
def get_all_questions(session: SessionDep):
    try:
        return session.exec(select(Question)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.post("/add-question", response_model=QuestionModel)
def add_question(session: SessionDep, new_question: QuestionModel):
    user_question = Question.model_validate(new_question)
    try: 
        session.add(user_question)
        session.commit()
        session.refresh(user_question)
        return user_question
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/question/{speaker_id}", response_model=List[QuestionModel])
def get_speaker_question(session: SessionDep, speaker_id: int):
    try:
        questions = session.exec(select(Question).where(Question.speaker_id == speaker_id)).all()
        return questions 
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
        
# ---- MISC FUNCTIONS ---- #

def publish_post():
    pass