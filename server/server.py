from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, Response, Header, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session
from typing import Annotated, List
from contextlib import asynccontextmanager
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
#from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from starlette.responses import JSONResponse
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv

from models.model import User, Event, Post, Ticket, MailList, Question, Validation, Transaction, Agenda, Banner, create_db_and_tables, get_session, engine
from models.base_model import UserModel, EventModel, UserReturn, QuestionModel, EmailSchema, LoginModel, PasswordReset, ForgetEmail, QuestionWithUser, TicketVerification, TicketValidation, InvoiceModel, UserUpdate, PostCreate, PostReturn, StaffTicketCreate, AgendaModel, AgendaUpdate, BannerModel, BannerReturn
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from gmail_sender import send_email

import asyncio, bcrypt, io, os, hmac, hashlib, json, re
from datetime import date as date_type
import qrcode
import jwt, httpx

load_dotenv()

# --- SESSION CONTROL ---- #

SESSION_SECRET = os.getenv("SESSION_SECRET")
if not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET is not set in environment")
SESSION_COOKIE = "session"
SESSION_MAX_AGE = 60 * 60 * 24 * 7

# --- BYL VARIABLES --- #
BYL_TOKEN = os.getenv("BYL_TOKEN")
_byl_url_raw = os.getenv("BYL_URL", "").strip().strip('"').strip("'")
BYL_URL = _byl_url_raw if _byl_url_raw.startswith(("http://", "https://")) else f"https://{_byl_url_raw}" if _byl_url_raw else ""
BYL_PROJECT_ID = 599
BYL_SECRET_KEY = os.getenv("BYL_SECRET_KEY")

serializer = URLSafeTimedSerializer(SESSION_SECRET)

def create_session_cookie(data: dict) -> str:
    return serializer.dumps(data)

def decode_session_cookie(token: str) -> dict:
    try:
        return serializer.loads(token, max_age=SESSION_MAX_AGE)
    except SignatureExpired:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except BadSignature:
        raise HTTPException(status_code=401, detail="Invalid session")

def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        return decode_session_cookie(token)
    
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_session_cookie(token)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
SessionDep = Annotated[Session, Depends(get_session)]

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:3000",
        "https://conference-app-fawn.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "https://conference-app-jade.vercel.app",
        "https://sciencedev.org",
    ],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- ROLE FUNCTION ---- # 

def require_role(*allowed_roles: str):
    def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail="Insufficient permissions"
            )
        return user
    return checker

def compute_day_length(start_date: str, end_date: str, include_weekends: bool) -> int:
    start = date_type.fromisoformat(start_date)
    end = date_type.fromisoformat(end_date)
    if start > end:
        return 1
    total = 0
    current = start
    while current <= end:
        if include_weekends or current.weekday() < 5:
            total += 1
        current += timedelta(days=1)
    return max(total, 1)

@app.get("/")
def greetings():
    return {"message": "Server started"}

# ---- USER FUNCTIONS ---- #

@app.get("/all-users", response_model=List[UserReturn])
def get_all_users(
    session: SessionDep, 
    current_user: dict = Depends(require_role("admin", "supervisor", "staff"))
):
    try:
        users = session.exec(select(User)).all()
        return users
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/user/{id}", response_model=UserReturn)
def get_user(
    session: SessionDep, 
    id: int,
    current_user: dict = Depends(require_role("admin", "supervisor"))
    ):

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

        new_mail_entry = MailList(
            user_id=db_user.id,
            email=db_user.email
        )

        session.add(new_mail_entry)
        session.commit()

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
def login_user(response: Response, session: SessionDep, login_data: LoginModel):
    try:
        db_user = session.exec(
            select(User).where(User.email == login_data.email)
        ).first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        password_match = bcrypt.checkpw(
            login_data.password.encode("utf-8"),
            db_user.password.encode("utf-8")
        )

        if not password_match:
            raise HTTPException(status_code=401, detail="Email or password doesn't match")

        # Return token in response body instead of cookie
        token = create_session_cookie({"user_id": db_user.id, "role": db_user.role})
        
        return JSONResponse(content={
            "id": db_user.id,
            "firstname": db_user.firstname,
            "lastname": db_user.lastname,
            "email": db_user.email,
            "phone_number": db_user.phone_number,
            "role": db_user.role,
            "token": token,  # ← send token in body
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.post("/forgot")
async def password_forgot(session: SessionDep, data: ForgetEmail, background_tasks: BackgroundTasks):
    try:
        print(f"Looking for email: {data.email}")
        
        db_user = session.exec(
            select(User).where(User.email == data.email)
        ).first()

        print(f"User found: {db_user}")

        if db_user:
            token = create_reset_token(db_user.email)
            print(f"Token created: {token}")
            await send_reset_email(db_user.email, token)
            print(f"Email sent to: {db_user.email}")
        else:
            print("No user found with that email")
            
        return {"message": "Reset password link has sent to email"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)  # changed to show actual error
        )

@app.post("/reset-password")
def password_reset(session: SessionDep, data: PasswordReset):

    RESET_SECRET_KEY = os.getenv("RESET_SECRET_KEY")
    RESET_ALGORITHM = os.getenv("RESET_ALGORITHM")

    # print(RESET_SECRET_KEY)
    # print(RESET_ALGORITHM)

    try:
        payload = jwt.decode(data.token, RESET_SECRET_KEY, algorithms=[RESET_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token structure")

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Reset token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    db_user = session.exec(select(User).where(User.email == email)).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    hashed_password = bcrypt.hashpw(
        data.new_password.encode("utf-8"),
        bcrypt.gensalt()
    )
    db_user.password = hashed_password.decode("utf-8")

    try:
        session.add(db_user)
        session.commit()
        return {"message": "Password successfully updated"}
    except Exception as e:
        session.rollback()
        print(f"Error resetting password: {e}")
        raise HTTPException(status_code=500, detail="Error updating database")

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE)
    return {"message": "Logged out"}

@app.put("/user/{id}", response_model=UserReturn)
def update_user(
    id: int,
    current_user: UserUpdate, 
    session: Session = Depends(get_session),
    user_info: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))
):
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
def delete_user(session: SessionDep, id: int, current_user: dict = Depends(require_role("admin", "supervisor"))):

    try:
        user = session.get(User, id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        if user.role == "admin":
            raise HTTPException(
                status_code=403,
                detail="Forbidden action"
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
def get_events(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))):
    try:
        return session.exec(select(Event).order_by(Event.start_date)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/public/events", response_model=List[Event])
def get_public_active_events(session: SessionDep):
    try:
        return session.exec(select(Event).where(Event.is_active == True).order_by(Event.start_date)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/public/all-events", response_model=List[Event])
def get_public_all_events(session: SessionDep):
    try:
        return session.exec(select(Event).order_by(Event.start_date)).all()
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

@app.post("/create-event", response_model=Event)
async def create_event(event: EventModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
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
async def update_event(event_id: int, event_data: EventModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
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

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/event/{event_id}")
async def delete_event(event_id: int, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_event = session.get(Event, event_id)
        if not db_event:
            raise HTTPException(status_code=404, detail="Event not found")

        session.delete(db_event)
        session.commit()
        return {"status": True, "message": "Event deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
# ---- AGENDA FUNCTIONS ---- #

@app.get("/event/{event_id}/agendas", response_model=List[Agenda])
async def get_event_agendas(event_id: int, session: SessionDep):
    try:
        return session.exec(select(Agenda).where(Agenda.event_id == event_id).order_by(Agenda.start_time)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/agenda/create", response_model=Agenda)
async def add_agenda(session: SessionDep, agenda: AgendaModel, current_user: dict = Depends(require_role("admin", "supervisor"))):
    db_agenda = Agenda.model_validate(agenda)
    try:
        session.add(db_agenda)
        session.commit()
        session.refresh(db_agenda)
        return db_agenda
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=400, detail="Agenda creation failed.")

@app.put("/agenda/{agenda_id}", response_model=Agenda)
async def update_agenda(agenda_id: int, session: SessionDep, agenda: AgendaUpdate, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_agenda = session.get(Agenda, agenda_id)
        if not db_agenda:
            raise HTTPException(status_code=404, detail="Agenda not found")

        data = agenda.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(db_agenda, key, value)

        session.add(db_agenda)
        session.commit()
        session.refresh(db_agenda)
        return db_agenda

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/agenda/{agenda_id}")
async def delete_agenda(agenda_id: int, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_agenda = session.get(Agenda, agenda_id)
        if not db_agenda:
            raise HTTPException(status_code=404, detail="Agenda not found")

        session.delete(db_agenda)
        session.commit()
        return {"status": True, "message": "Agenda deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
        
    
# ---- TICKET FUNCTIONS ---- #

@app.get("/validate/{ticket_uuid}", response_model=TicketVerification)
def validate_ticket(
    session: SessionDep, 
    ticket_uuid: str, 
    current_user: dict = Depends(require_role("admin", "supervisor", "staff"))
):
    try:
        statement = select(Ticket, User).where(Ticket.qr_code_data == ticket_uuid).join(User, Ticket.user_id == User.id)
        result = session.exec(statement).first()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Invalid ticket or user not found"
            )
        
        db_ticket, attendee = result

        if db_ticket.used_times >= db_ticket.day_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket expired: no entries remaining"
            )

        db_ticket.used_times += 1
        session.add(db_ticket)
        session.commit()
        session.refresh(db_ticket)

        return TicketVerification(
            ticket_uuid=db_ticket.qr_code_data,
            username=f"{attendee.firstname} {attendee.lastname}",
            user_id=db_ticket.user_id,
            entry_day=db_ticket.day_length,
            used_times=db_ticket.used_times,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error during ticket validation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal server error"
        )

@app.post("/ticket/validation", response_model=TicketValidation)
def ticket_validation(session: SessionDep, val_ticket: TicketValidation, current_user: dict = Depends(require_role("staff"))):
    ticket_info = Validation.model_validate(val_ticket)

    if not ticket_info:
        print("Empty ticket: ERROR !")
        raise HTTPException(status_code=401, detail="Cannot submit empty ticket")
    
    try:
        session.add(ticket_info)
        session.commit()
        session.refresh(ticket_info)
        return ticket_info

    except Exception as e:
        session.rollback()
        print(f'Error occured: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/ticket/get-validations", response_model=list[TicketValidation])
def get_validations(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor", "staff"))):
    validations = session.exec(select(Validation)).all()
    result = []
    for v in validations:
        ticket = session.exec(select(Ticket).where(Ticket.qr_code_data == v.ticket_uuid)).first()
        attendee = session.get(User, ticket.user_id) if ticket else None
        result.append(TicketValidation(
            ticket_uuid=v.ticket_uuid,
            user_id=ticket.user_id if ticket else v.user_id,
            validated_user=v.validated_user,
            validation_time=v.validation_time,
            attendee_name=f"{attendee.firstname} {attendee.lastname}" if attendee else "Unknown",
        ))
    return result

@app.get("/ticket/get-validations-full")
def get_validations_full(session: SessionDep, current_user: dict = Depends(require_role("admin","supervisor"))):
    validations = session.exec(select(Validation)).all()
    result = []
    for v in validations:
        ticket = session.exec(select(Ticket).where(Ticket.qr_code_data == v.ticket_uuid)).first()
        attendee = session.get(User, ticket.user_id) if ticket else None
        attendee_name = f"{attendee.firstname} {attendee.lastname}" if attendee else "Unknown"
        result.append({
            "val_id": v.val_id,
            "ticket_uuid": v.ticket_uuid,
            "validated_user": attendee_name,
            "staff_name": v.validated_user,
            "staff_id": v.user_id,
            "validation_time": v.validation_time,
        })
    return result

@app.get("/all-transactions")
def get_all_transactions(session: SessionDep, current_user: dict = Depends(require_role("admin","supervisor"))):
    transactions = session.exec(select(Transaction)).all()
    result = []
    for t in transactions:
        user = session.get(User, t.user_id)
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "username": f"{user.firstname} {user.lastname}" if user else "Unknown",
            "amount": t.amount,
            "transaction_id": t.transaction_id,
            "created_at": t.created_at,
            "description": t.description,
            "url": t.url,
        })
    return result

@app.get("/tickets/summary")
def tickets_summary(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    tickets = session.exec(select(Ticket)).all()
    return {"user_ids": list(set(t.user_id for t in tickets))}

@app.get("/admin/tickets")
def get_all_tickets(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    tickets = session.exec(select(Ticket)).all()
    result = []
    for t in tickets:
        user = session.get(User, t.user_id)
        event = session.get(Event, t.event_id) if t.event_id else None
        result.append({
            "id": t.id,
            "user_id": t.user_id,
            "event_id": t.event_id,
            "event_name": event.event_name if event else None,
            "name": t.name,
            "day_length": t.day_length,
            "used_times": t.used_times,
            "qr_code_data": t.qr_code_data,
            "firstname": user.firstname if user else "Unknown",
            "lastname": user.lastname if user else "Unknown",
            "email": user.email if user else "",
        })
    return result

@app.post("/admin/ticket/issue/{user_id}")
async def admin_issue_ticket(
    user_id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    event_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "supervisor")),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    background_tasks.add_task(_issue_ticket, user_id, event_id)
    return {"message": f"Ticket will be issued and emailed to {user.email}"}

@app.delete("/admin/ticket/{user_id}")
def admin_delete_ticket(
    user_id: int,
    session: SessionDep,
    current_user: dict = Depends(require_role("admin", "supervisor")),
):
    ticket = session.exec(select(Ticket).where(Ticket.user_id == user_id)).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    session.delete(ticket)
    session.commit()
    return {"message": "Ticket deleted"}

@app.post("/staff/ticket/create")
async def staff_create_ticket(
    data: StaffTicketCreate,
    session: SessionDep,
    current_user: dict = Depends(require_role("admin", "supervisor", "staff")),
):
    db_event = session.get(Event, data.event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    existing_user = session.exec(select(User).where(User.email == data.email)).first()

    if existing_user:
        user_id = existing_user.id
        username = f"{existing_user.firstname} {existing_user.lastname}"
    else:
        random_password = str(uuid4()).replace("-", "")[:16]
        hashed = bcrypt.hashpw(random_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        new_user = User(
            firstname=data.firstname,
            lastname=data.lastname,
            email=data.email,
            phone_number=data.phone_number,
            password=hashed,
            role="attendee",
        )
        session.add(new_user)
        try:
            session.commit()
            session.refresh(new_user)
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="Email already registered")

        new_mail_entry = MailList(user_id=new_user.id, email=new_user.email)
        session.add(new_mail_entry)
        session.commit()
        user_id = new_user.id
        username = f"{data.firstname} {data.lastname}"

    existing_ticket = session.exec(
        select(Ticket).where(Ticket.user_id == user_id, Ticket.event_id == data.event_id)
    ).first()
    if existing_ticket:
        raise HTTPException(status_code=409, detail="This attendee already has a ticket for this event")

    if not BYL_URL or not BYL_TOKEN:
        raise HTTPException(status_code=503, detail="Payment service not configured")

    amount = int(db_event.ticket_price)
    headers = {
        "Authorization": f"Bearer {BYL_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    invoice_payload = {
        "amount": amount,
        "description": f"ID:{user_id} | NAME:{username} | EVENT:{data.event_id}",
        "auto_advance": True,
    }

    try:
        async with httpx.AsyncClient() as http:
            response = await http.post(
                f"{BYL_URL}/api/v1/projects/{BYL_PROJECT_ID}/invoices",
                headers=headers,
                json=invoice_payload,
            )
            if not response.is_success:
                raise HTTPException(status_code=502, detail="Failed to create invoice")
            result = response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Payment service unreachable: {str(e)}")

    invoice_url = result.get("data", {}).get("url")
    if not invoice_url:
        raise HTTPException(status_code=502, detail="Invoice URL not found in response")

    return {"invoice_url": invoice_url, "email": data.email, "amount": amount}

@app.get("/tickets")
def get_total_tickets(session: SessionDep, current_user: dict = Depends(require_role("admin","supervisor","staff"))):
    return len(session.exec(select(Ticket)).all())

@app.get("/ticket/check")
def check_user_ticket(session: SessionDep, current_user: dict = Depends(require_role("attendee"))):
    user_id = current_user.get("user_id")
    tickets = session.exec(select(Ticket).where(Ticket.user_id == user_id)).all()
    return {
        "has_ticket": len(tickets) > 0,
        "ticket_event_ids": [t.event_id for t in tickets if t.event_id is not None],
    }

@app.post("/invoice")
async def create_invoice(session: SessionDep, data: InvoiceModel, current_user: dict = Depends(require_role("attendee"))):

    if data.event_id:
        existing_ticket = session.exec(
            select(Ticket).where(Ticket.user_id == data.user_id, Ticket.event_id == data.event_id)
        ).first()
        if existing_ticket:
            raise HTTPException(status_code=409, detail="You already have a ticket for this event")

    if not BYL_URL or not BYL_TOKEN:
        raise HTTPException(status_code=503, detail="Payment service not configured")

    url = f"{BYL_URL}/api/v1/projects/{BYL_PROJECT_ID}/invoices"
    headers = {
        "Authorization": f"Bearer {BYL_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    event_part = f" | EVENT:{data.event_id}" if data.event_id else ""
    payload = {
        "amount": data.amount,
        "description": f"ID:{data.user_id} | NAME:{data.username}{event_part}",
        "auto_advance": True
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)

            if not response.is_success:
                return {"error": "Failed to create invoice", "details": response.json()}

            result = response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Payment service unreachable: {str(e)}")

    invoice_url = result.get("data", {}).get("url")

    if invoice_url:
        return {"invoice_url": invoice_url}

    return {"error": "Invoice URL not found in response"}

@app.post("/byl/webhook")
async def byl_webhook(session: SessionDep, request: Request, background_tasks: BackgroundTasks, byl_signature: str = Header(None)):
    raw_body = await request.body()
    payload_str = raw_body.decode("utf-8")

    key_bytes = BYL_SECRET_KEY.encode("utf-8")
    payload_bytes = payload_str.encode("utf-8")

    computed_signature = hmac.new(
        key_bytes,
        msg=payload_bytes,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not byl_signature or not hmac.compare_digest(computed_signature, byl_signature):
        raise HTTPException(status_code=403, detail="Invalid webhook signature")

    try:
        webhook_data = json.loads(payload_str)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    event_type = webhook_data.get("type")
    invoice_object = webhook_data.get("data", {}).get("object", {})
    status = invoice_object.get("status")
    description = invoice_object.get("description", "")

    if event_type == "invoice.paid" and status == "paid":
        match_id = re.search(r"ID:(\d+)", description)
        if match_id:
            extracted_user_id = int(match_id.group(1))
            match_event = re.search(r"EVENT:(\d+)", description)
            extracted_event_id = int(match_event.group(1)) if match_event else None

            invoice_id = invoice_object.get("id")
            existing_tx = session.exec(
                select(Transaction).where(Transaction.transaction_id == invoice_id)
            ).first()

            if existing_tx:
                print(f"Duplicate webhook for transaction {invoice_id}, skipping")
            else:
                new_transaction = Transaction(
                    user_id=extracted_user_id,
                    amount=invoice_object.get("amount"),
                    transaction_id=invoice_id,
                    created_at=invoice_object.get("created_at"),
                    description=description,
                    url=invoice_object.get("url"),
                )
                session.add(new_transaction)
                session.commit()
                print(f"Transaction saved for user {extracted_user_id}")

                background_tasks.add_task(_issue_ticket, extracted_user_id, extracted_event_id)

    return Response(content="Webhook received!", media_type="text/plain")

# ---- POST FUNCTIONS ---- #

@app.get("/all-posts", response_model=List[PostReturn])
def get_all_posts(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor", "attendee"))):
    try:
        return session.exec(select(Post).order_by(Post.time.desc())).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/create-post", response_model=PostReturn)
async def create_post(session: SessionDep, data: PostCreate, current_user: dict = Depends(require_role("admin", "supervisor"))):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    db_post = Post(
        user_id=current_user.get("user_id"),
        time=now,
        header=data.header,
        body=data.body,
        staff_only=data.staff_only,
    )
    try:
        session.add(db_post)
        session.commit()
        session.refresh(db_post)

        if data.staff_only:
            recipients = session.exec(
                select(User).where(User.role.in_(["staff", "supervisor", "admin"]))
            ).all()
        else:
            recipients = session.exec(
                select(User).where(User.role == "attendee")
            ).all()
        email_list = [EmailSchema(email=u.email) for u in recipients]

        await publish_post(db_post=db_post, email_list=email_list)

        return db_post
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error occurred")

@app.delete("/delete-post/{post_id}")
async def delete_post(post_id: int, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_post = session.get(Post, post_id)
        if not db_post:
            raise HTTPException(status_code=404, detail="Post not found")

        session.delete(db_post)
        session.commit()
        return {"message": "Post deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ---- BANNER FUNCTIONS ---- #

@app.get("/public/banners", response_model=List[BannerReturn])
def get_public_banners(session: SessionDep):
    try:
        banners = session.exec(select(Banner).where(Banner.is_active == True)).all()
        result = []
        for b in banners:
            event = session.get(Event, b.event_id) if b.event_id else None
            if b.event_id and (not event or not event.is_active):
                continue
            result.append(BannerReturn(
                id=b.id,
                event_id=b.event_id,
                description=b.description,
                image_url=b.image_url,
                is_active=b.is_active,
                created_at=b.created_at,
                event_name=event.event_name if event else None,
                start_date=event.start_date if event else None,
                end_date=event.end_date if event else None,
                ticket_price=event.ticket_price if event else None,
            ))
        result.sort(key=lambda x: x.start_date or "")
        return result
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/banners", response_model=List[BannerReturn])
def get_all_banners(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        banners = session.exec(select(Banner).order_by(Banner.created_at.desc())).all()
        result = []
        for b in banners:
            event = session.get(Event, b.event_id) if b.event_id else None
            result.append(BannerReturn(
                id=b.id,
                event_id=b.event_id,
                description=b.description,
                image_url=b.image_url,
                is_active=b.is_active,
                created_at=b.created_at,
                event_name=event.event_name if event else None,
                start_date=event.start_date if event else None,
                end_date=event.end_date if event else None,
                ticket_price=event.ticket_price if event else None,
            ))
        return result
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/banners", response_model=BannerReturn)
async def create_banner(data: BannerModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    db_banner = Banner(
        event_id=data.event_id,
        description=data.description,
        image_url=data.image_url,
        is_active=data.is_active,
        created_at=now,
    )
    try:
        session.add(db_banner)
        session.commit()
        session.refresh(db_banner)
        event = session.get(Event, db_banner.event_id) if db_banner.event_id else None
        return BannerReturn(
            id=db_banner.id,
            event_id=db_banner.event_id,
            description=db_banner.description,
            image_url=db_banner.image_url,
            is_active=db_banner.is_active,
            created_at=db_banner.created_at,
            event_name=event.event_name if event else None,
            start_date=event.start_date if event else None,
            end_date=event.end_date if event else None,
            ticket_price=event.ticket_price if event else None,
        )
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Error creating banner")

@app.put("/banners/{banner_id}", response_model=BannerReturn)
async def update_banner(banner_id: int, data: BannerModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_banner = session.get(Banner, banner_id)
        if not db_banner:
            raise HTTPException(status_code=404, detail="Banner not found")
        db_banner.event_id = data.event_id
        db_banner.description = data.description
        db_banner.image_url = data.image_url
        db_banner.is_active = data.is_active
        session.add(db_banner)
        session.commit()
        session.refresh(db_banner)
        event = session.get(Event, db_banner.event_id) if db_banner.event_id else None
        return BannerReturn(
            id=db_banner.id,
            event_id=db_banner.event_id,
            description=db_banner.description,
            image_url=db_banner.image_url,
            is_active=db_banner.is_active,
            created_at=db_banner.created_at,
            event_name=event.event_name if event else None,
            start_date=event.start_date if event else None,
            end_date=event.end_date if event else None,
            ticket_price=event.ticket_price if event else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/banners/{banner_id}")
async def delete_banner(banner_id: int, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_banner = session.get(Banner, banner_id)
        if not db_banner:
            raise HTTPException(status_code=404, detail="Banner not found")
        session.delete(db_banner)
        session.commit()
        return {"message": "Banner deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

# ---- QUESTION FUNCTIONS ---- #

@app.get("/all-questions", response_model=List[QuestionModel])
def get_all_questions(session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor", "staff"))):
    try:
        return session.exec(select(Question)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.post("/add-question", response_model=QuestionModel)
def add_question(session: SessionDep, new_question: QuestionModel, current_user: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))):
    user_question = Question.model_validate(new_question)
    try: 
        session.add(user_question)
        session.commit()
        session.refresh(user_question)
        return user_question
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/question/{user_id}", response_model=List[QuestionModel])
def get_speaker_question(session: SessionDep, user_id: int, current_user: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))):
    try:
        questions = session.exec(select(Question).where(Question.user_id == user_id)).all()

        if not questions:
            raise HTTPException(status_code=404, detail="No questions found")

        return questions 
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/all-questions-with-users", response_model=List[QuestionWithUser])
def get_all_questions_with_users(
    session: SessionDep,
    current_user: dict = Depends(require_role("admin", "supervisor", "staff"))
):
    try:
        questions = session.exec(select(Question)).all()
        result = []
        for q in questions:
            user = session.get(User, q.user_id)
            fullname = f"{user.firstname} {user.lastname}" if user else "Unknown"
            result.append(QuestionWithUser(
                id=q.id,
                user_id=q.user_id,
                event_id=q.event_id,
                question=q.question,
                time=q.time,
                fullname=fullname
            ))
        return result
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

# ---- MAIL FUNCTIONS ---- #

async def mail_service(type: str, db_event: Event, email: List[EmailSchema]):

    status = type.upper()

    if status == "CREATED":
        banner_color = "#16a34a"
        status_emoji = "🟢"
        status_text = "New Event Announced"
        intro_text = f"We are excited to announce a new session has been added to the Mongolia - CERN LHCb  2026 conference programme. Mark your calendar and don't miss this opportunity to engage with world leading physicists."
    elif status == "UPDATED":
        banner_color = "#2563eb"
        status_emoji = "🔵"
        status_text = "Event Updated"
        intro_text = f"An event in the Mongolia - CERN LHCb  2026 conference programme has been updated. Please review the latest details below and update your schedule accordingly."
    elif status == "CANCELLED":
        banner_color = "#dc2626"
        status_emoji = "🔴"
        status_text = "Event Cancelled"
        intro_text = f"We regret to inform you that the following session has been cancelled from the Mongolia - CERN LHCb  2026 conference programme. We apologize for any inconvenience this may cause."
    else:
        banner_color = "#38bdf8"
        status_emoji = "📢"
        status_text = "Event Announcement"
        intro_text = "Please see the latest update regarding the Mongolia - CERN LHCb  2026 conference programme below."

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#060911;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060911;padding:40px 0;">
        <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">

            <!-- TOP BADGE -->
            <tr>
                <td align="center" style="padding-bottom:24px;">
                <span style="
                    display:inline-block;
                    font-family:'Courier New',monospace;
                    font-size:13px;
                    letter-spacing:0.15em;
                    color:#38bdf8;
                    border:1px solid rgba(56,189,248,0.3);
                    background:rgba(56,189,248,0.07);
                    padding:6px 16px;
                    border-radius:4px;
                ">CERN LHCb — MONGOLIA 2026</span>
                </td>
            </tr>

            <!-- MAIN CARD -->
            <tr>
                <td style="
                background:rgba(6,10,22,0.95);
                border:1px solid rgba(56,189,248,0.16);
                border-radius:16px;
                overflow:hidden;
                ">

                <!-- HEADER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="
                        background:linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#0f172a 100%);
                        padding:40px 40px 36px;
                        border-bottom:1px solid {banner_color}33;
                        text-align:center;
                    ">
                        <div style="
                        width:12px;height:12px;border-radius:50%;
                        background:{banner_color};
                        box-shadow:0 0 20px 6px {banner_color}99;
                        margin:0 auto 20px;
                        display:block;
                        "></div>

                        <h1 style="
                        margin:0 0 10px;
                        font-size:26px;
                        font-weight:700;
                        color:#ffffff;
                        letter-spacing:-0.02em;
                        line-height:1.2;
                        ">{status_emoji} {status_text}</h1>

                        <p style="
                        margin:0;
                        font-size:13px;
                        color:#94a3b8;
                        font-family:'Courier New',monospace;
                        letter-spacing:0.08em;
                        ">HIGH ENERGY PHYSICS CONFERENCE · ULAANBAATAR</p>
                    </td>
                    </tr>
                </table>

                <!-- BODY -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:36px 40px;">

                        <p style="
                        margin:0 0 8px;
                        font-size:13px;
                        font-family:'Courier New',monospace;
                        color:{banner_color};
                        letter-spacing:0.12em;
                        ">EVENT DETAILS</p>

                        <h2 style="
                        margin:0 0 16px;
                        font-size:22px;
                        font-weight:700;
                        color:#ffffff;
                        line-height:1.4;
                        ">{db_event.event_name}</h2>

                        <!-- Intro text -->
                        <p style="
                        margin:0 0 28px;
                        font-size:15px;
                        color:#94a3b8;
                        line-height:1.7;
                        ">{intro_text}</p>

                        <!-- INFO CARDS: Date range / Ticket price -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                            <td width="50%" style="padding-right:6px;">
                            <div style="
                                background:rgba(56,189,248,0.05);
                                border:1px solid rgba(56,189,248,0.14);
                                border-radius:10px;
                                padding:16px 18px;
                            ">
                                <div style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;letter-spacing:0.08em;margin-bottom:6px;">📅 DATE</div>
                                <div style="font-size:15px;color:#ffffff;font-weight:600;">{db_event.start_date}{f" — {db_event.end_date}" if db_event.end_date != db_event.start_date else ""}</div>
                            </div>
                            </td>
                            <td width="50%" style="padding-left:6px;">
                            <div style="
                                background:rgba(52,211,153,0.05);
                                border:1px solid rgba(52,211,153,0.14);
                                border-radius:10px;
                                padding:16px 18px;
                            ">
                                <div style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;letter-spacing:0.08em;margin-bottom:6px;">🎫 TICKET PRICE</div>
                                <div style="font-size:15px;color:#ffffff;font-weight:600;">₮{int(db_event.ticket_price):,}</div>
                            </div>
                            </td>
                        </tr>
                        </table>

                        <!-- Description (if any) -->
                        {f'''<div style="
                        background:rgba(255,255,255,0.02);
                        border:1px solid rgba(255,255,255,0.07);
                        border-radius:10px;
                        padding:20px 22px;
                        margin-bottom:24px;
                        font-size:15px;
                        color:#94a3b8;
                        line-height:1.8;
                        white-space:pre-line;
                        ">{db_event.description}</div>''' if db_event.description else ""}

                        <!-- NOTICE -->
                        <div style="
                        background:rgba(56,189,248,0.05);
                        border:1px solid rgba(56,189,248,0.18);
                        border-left:3px solid {banner_color};
                        border-radius:0 10px 10px 0;
                        padding:16px 20px;
                        margin-bottom:28px;
                        ">
                        <p style="
                            margin:0 0 6px;
                            font-size:13px;
                            font-family:'Courier New',monospace;
                            color:{banner_color};
                            letter-spacing:0.08em;
                        ">📌 STAY UPDATED</p>
                        <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                            Please stay updated through official CERN Mongolia 2026
                            announcements and check the conference portal regularly
                            for the latest programme changes.
                        </p>
                        </div>

                        <!-- SIGN OFF -->
                        <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
                        Thank you,<br>
                        <span style="color:#94a3b8;font-weight:600;">CERN LHCb — Mongolia 2026 Event Team</span>
                        </p>

                    </td>
                    </tr>
                </table>

                <!-- ENERGY BAR -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:0 40px;">
                        <div style="
                        height:2px;
                        border-radius:2px;
                        background:linear-gradient(90deg,#38bdf8,#f472b6,#34d399);
                        opacity:0.3;
                        "></div>
                    </td>
                    </tr>
                </table>

                <!-- FOOTER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:24px 40px;text-align:center;">
                        <p style="
                        margin:0;
                        font-size:12px;
                        font-family:'Courier New',monospace;
                        color:#334155;
                        letter-spacing:0.06em;
                        ">
                        AUTOMATED NOTIFICATION — DO NOT REPLY<br>
                        © MONGOLIA - CERN LHCb 2026 CONFERENCE
                        </p>
                    </td>
                    </tr>
                </table>

                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>

    </body>
    </html>
    """

    recipients = [entry.email for entry in email]
    await send_email(
        to=recipients,
        subject=f"{status_emoji} {status_text} | CERN Mongolia 2026",
        html_body=html_body
    )

# ---- MISC FUNCTIONS ---- #

async def publish_event(type: str, db_event: Event, email_list: List[EmailSchema]):
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    match type:
        case "created":
            await mail_service(type=type, db_event=db_event, email=email_list)
        case "updated":
            await mail_service(type=type, db_event=db_event, email=email_list)
        case "cancelled":
            await mail_service(type=type, db_event=db_event, email=email_list)

async def post_mail_service(db_post: Post, email: List[EmailSchema]):
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#060911;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060911;padding:40px 0;">
        <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">

            <!-- TOP BADGE -->
            <tr>
                <td align="center" style="padding-bottom:24px;">
                <span style="
                    display:inline-block;
                    font-family:'Courier New',monospace;
                    font-size:13px;
                    letter-spacing:0.15em;
                    color:#38bdf8;
                    border:1px solid rgba(56,189,248,0.3);
                    background:rgba(56,189,248,0.07);
                    padding:6px 16px;
                    border-radius:4px;
                ">MONGOLIA - CERN LHCb 2026</span>
                </td>
            </tr>

            <!-- MAIN CARD -->
            <tr>
                <td style="
                background:rgba(6,10,22,0.95);
                border:1px solid rgba(56,189,248,0.16);
                border-radius:16px;
                overflow:hidden;
                ">

                <!-- HEADER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="
                        background:linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#0f172a 100%);
                        padding:40px 40px 36px;
                        border-bottom:1px solid #7c3aed33;
                        text-align:center;
                    ">
                        <div style="
                        width:12px;height:12px;border-radius:50%;
                        background:#7c3aed;
                        box-shadow:0 0 20px 6px #7c3aed99;
                        margin:0 auto 20px;
                        display:block;
                        "></div>

                        <h1 style="
                        margin:0 0 10px;
                        font-size:26px;
                        font-weight:700;
                        color:#ffffff;
                        letter-spacing:-0.02em;
                        line-height:1.2;
                        ">{db_post.header}</h1>
                    </td>
                    </tr>
                </table>

                <!-- BODY -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:36px 40px;">

                        <div style="
                        background:rgba(255,255,255,0.02);
                        border:1px solid rgba(255,255,255,0.07);
                        border-left:3px solid #7c3aed;
                        border-radius:0 10px 10px 0;
                        padding:20px 22px;
                        margin-bottom:28px;
                        font-size:15px;
                        color:#94a3b8;
                        line-height:1.8;
                        white-space:pre-line;
                        ">{db_post.body}</div>

                        <div style="
                        background:rgba(56,189,248,0.05);
                        border:1px solid rgba(56,189,248,0.18);
                        border-left:3px solid #38bdf8;
                        border-radius:0 10px 10px 0;
                        padding:16px 20px;
                        margin-bottom:28px;
                        ">
                        <p style="
                            margin:0 0 6px;
                            font-size:13px;
                            font-family:'Courier New',monospace;
                            color:#38bdf8;
                            letter-spacing:0.08em;
                        ">📌 STAY UPDATED</p>
                        <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                            Check the conference portal regularly for the latest updates
                            and announcements from the CERN Mongolia 2026 team.
                        </p>
                        </div>

                        <p style="margin:0;font-size:13px;color:#475569;font-family:'Courier New',monospace;">
                        Posted: {db_post.time} UTC
                        </p>

                    </td>
                    </tr>
                </table>

                <!-- ENERGY BAR -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:0 40px;">
                        <div style="
                        height:2px;
                        border-radius:2px;
                        background:linear-gradient(90deg,#38bdf8,#f472b6,#34d399);
                        opacity:0.3;
                        "></div>
                    </td>
                    </tr>
                </table>

                <!-- FOOTER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:24px 40px;text-align:center;">
                        <p style="
                        margin:0;
                        font-size:12px;
                        font-family:'Courier New',monospace;
                        color:#334155;
                        letter-spacing:0.06em;
                        ">
                        AUTOMATED NOTIFICATION — DO NOT REPLY<br>
                        © MONGOLIA - CERN LHCb 2026 CONFERENCE
                        </p>
                    </td>
                    </tr>
                </table>

                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>

    </body>
    </html>
    """
    recipients = [entry.email for entry in email]
    await send_email(
        to=recipients,
        subject="Шинэ зарлал | New Announcement - Mongolia - CERN LHCb 2026",
        html_body=html_body
    )

async def publish_post(db_post: Post, email_list: List[EmailSchema]):
    await post_mail_service(db_post=db_post, email=email_list)

async def _issue_ticket(user_id: int, event_id: int | None = None):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            print(f"User {user_id} not found, cannot issue ticket")
            return

        FRONT_URL = os.getenv("FRONT_URL", "")
        firstname = user.firstname
        lastname = user.lastname
        email = user.email

        # Compute day_length and price from event
        day_length = 1
        price = 0.0
        ticket_name = "Conference Pass"
        event_start_date: str | None = None
        event_end_date: str | None = None
        event_description: str | None = None
        event_location: str | None = None
        if event_id:
            db_event = session.get(Event, event_id)
            if db_event:
                day_length = compute_day_length(db_event.start_date, db_event.end_date, db_event.include_weekends)
                price = db_event.ticket_price
                ticket_name = db_event.event_name
                event_start_date = db_event.start_date
                event_end_date = db_event.end_date
                event_description = db_event.description
                event_location = db_event.location

        existing = session.exec(
            select(Ticket).where(Ticket.user_id == user_id, Ticket.event_id == event_id)
        ).first()
        if existing:
            ticket_uuid = existing.qr_code_data
            print(f"Ticket already exists for user {user_id} event {event_id}, resending email")
        else:
            ticket_uuid = str(uuid4())
            new_ticket = Ticket(
                user_id=user_id,
                event_id=event_id,
                name=ticket_name,
                price=price,
                day_length=day_length,
                used_times=0,
                qr_code_data=ticket_uuid,
            )
            session.add(new_ticket)
            session.commit()

    qr_buffer = await asyncio.to_thread(generate_qr_buffer, f"{FRONT_URL}/validate/{ticket_uuid}")

    UPLOAD_DIR = "tickets"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"ticket_{firstname}.png")

    def _write():
        with open(file_path, "wb") as f:
            f.write(qr_buffer.getvalue())

    await asyncio.to_thread(_write)

    await send_email(
        to=[email],
        subject=f"{ticket_name} | Ticket",
        html_body=_build_ticket_email(firstname, lastname, day_length, ticket_name, price,
                                      event_start_date, event_end_date, event_description, event_location),
        attachment_path=file_path,
    )
    print(f"Ticket issued and emailed to user {user_id}")


def _build_ticket_email(firstname: str, lastname: str, day_length: int,
                        event_name: str = "Conference Pass",
                        price: float = 0.0,
                        start_date: str | None = None,
                        end_date: str | None = None,
                        description: str | None = None,
                        location: str | None = None) -> str:
    days_label = f"{day_length} Day{'s' if day_length > 1 else ''}"
    price_label = f"₮{int(price):,}" if price else "—"
    date_label = start_date or "—"
    if end_date and end_date != start_date:
        date_label += f" — {end_date}"

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="margin:0;padding:0;background-color:#060911;font-family:'Segoe UI',Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060911;padding:40px 0;">
  <tr>
    <td align="center">

      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">

        <tr>
          <td align="center" style="padding-bottom:24px;">
            <span style="display:inline-block;font-family:'Courier New',monospace;font-size:13px;letter-spacing:0.15em;color:#38bdf8;border:1px solid rgba(56,189,248,0.3);background:rgba(56,189,248,0.07);padding:6px 16px;border-radius:4px;">
              {event_name.upper()}
            </span>
          </td>
        </tr>

        <tr>
          <td style="background:rgba(6,10,22,0.95);border:1px solid rgba(56,189,248,0.16);border-radius:16px;overflow:hidden;">

            <!-- HEADER -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#0f172a 100%);padding:40px 40px 36px;border-bottom:1px solid rgba(56,189,248,0.16);text-align:center;">

                  <div style="width:12px;height:12px;border-radius:50%;background:#38bdf8;box-shadow:0 0 20px 6px rgba(56,189,248,0.6);margin:0 auto 20px;display:block;"></div>

                  <h1 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1.2;">
                    {event_name}
                  </h1>

                  <p style="margin:0;font-size:14px;color:#94a3b8;font-family:'Courier New',monospace;letter-spacing:0.08em;">
                    TICKET CONFIRMED · {date_label.upper()}
                  </p>

                </td>
              </tr>
            </table>

            <!-- BODY -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:36px 40px;">

                  <p style="margin:0 0 8px;font-size:13px;font-family:'Courier New',monospace;color:#38bdf8;letter-spacing:0.12em;">
                    PARTICIPANT
                  </p>

                  <h2 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#ffffff;">
                    {firstname} {lastname}
                  </h2>

                  <p style="margin:0 0 28px;font-size:15px;color:#94a3b8;line-height:1.7;">
                    Your ticket for <strong style="color:#ffffff;">{event_name}</strong> has been successfully generated.
                    Please find your QR code attached to this email and present it
                    at the entrance for verification.
                  </p>

                  <!-- INFO CARDS -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>

                      <td width="33%" style="padding-right:8px;">
                        <div style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.14);border-radius:10px;padding:16px;text-align:center;">
                          <div style="font-size:20px;margin-bottom:6px;">🎟️</div>
                          <div style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;letter-spacing:0.06em;">
                            TYPE
                          </div>
                          <div style="font-size:13px;color:#ffffff;font-weight:600;margin-top:4px;">
                            {event_name}
                          </div>
                        </div>
                      </td>

                      <td width="33%" style="padding:0 4px;">
                        <div style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.14);border-radius:10px;padding:16px;text-align:center;">
                          <div style="font-size:20px;margin-bottom:6px;">📅</div>
                          <div style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;letter-spacing:0.06em;">
                            DURATION
                          </div>
                          <div style="font-size:13px;color:#ffffff;font-weight:600;margin-top:4px;">
                            {days_label}
                          </div>
                        </div>
                      </td>

                      <td width="33%" style="padding-left:8px;">
                        <div style="background:rgba(52,211,153,0.05);border:1px solid rgba(52,211,153,0.14);border-radius:10px;padding:16px;text-align:center;">
                          <div style="font-size:20px;margin-bottom:6px;">✅</div>
                          <div style="font-size:11px;color:#64748b;font-family:'Courier New',monospace;letter-spacing:0.06em;">
                            STATUS
                          </div>
                          <div style="font-size:13px;color:#34d399;font-weight:600;margin-top:4px;">
                            Confirmed
                          </div>
                        </div>
                      </td>

                    </tr>
                  </table>

                  <!-- IMPORTANT -->
                  <div style="background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.18);border-left:3px solid #38bdf8;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:28px;">

                    <p style="margin:0 0 6px;font-size:13px;font-family:'Courier New',monospace;color:#38bdf8;letter-spacing:0.08em;">
                      📌 IMPORTANT
                    </p>

                    <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                      Each QR code ticket is valid for the number of days selected
                      at purchase. The QR code will be scanned once per day at the entrance.
                    </p>

                  </div>

                  <!-- EVENT INFO -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td style="background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.18);border-radius:12px;padding:22px;">

                        <p style="margin:0 0 12px;font-size:13px;font-family:'Courier New',monospace;color:#f59e0b;letter-spacing:0.08em;">
                          📍 EVENT INFORMATION
                        </p>

                        <p style="margin:0 0 8px;font-size:16px;color:#ffffff;font-weight:700;line-height:1.4;">
                          {event_name}
                        </p>

                        <p style="margin:0 0 14px;font-size:15px;color:#e2e8f0;line-height:1.8;">
                          {f'<strong>📍 Location:</strong> {location}<br>' if location else ''}
                          <strong>📅 Date:</strong> {date_label}<br>
                          <strong>🎫 Ticket Price:</strong> {price_label}
                        </p>

                        {f'<p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.7;">{description}</p>' if description else ''}

                      </td>
                    </tr>
                  </table>

                  <!-- QR INFO -->
                  <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:18px 20px;margin-bottom:28px;text-align:center;">

                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                      🔗 Your QR code ticket is attached as a
                      <strong style="color:#94a3b8;">PNG image</strong>.
                      Download and save it to your phone for easy access at the venue.
                    </p>

                  </div>

                  <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
                    We look forward to seeing you at the event.<br>
                    <span style="color:#94a3b8;font-weight:600;">
                      {event_name} — Organizing Team
                    </span>
                  </p>

                </td>
              </tr>
            </table>

            <!-- GRADIENT LINE -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 40px;">
                  <div style="height:2px;border-radius:2px;background:linear-gradient(90deg,#38bdf8,#f472b6,#34d399);opacity:0.3;"></div>
                </td>
              </tr>
            </table>

            <!-- FOOTER -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:24px 40px;text-align:center;">

                  <p style="margin:0;font-size:12px;font-family:'Courier New',monospace;color:#334155;letter-spacing:0.06em;">
                    AUTOMATED NOTIFICATION — DO NOT REPLY<br>
                    © {event_name.upper()}
                  </p>

                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
"""

def generate_qr_buffer(data: str):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )

    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer

def create_reset_token(email: str) -> str:

    RESET_SECRET_KEY = os.getenv("RESET_SECRET_KEY")
    RESET_ALGORITHM = os.getenv("RESET_ALGORITHM")

    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"exp": expire, "sub": email}
    return jwt.encode(to_encode, RESET_SECRET_KEY, algorithm=RESET_ALGORITHM)

async def send_reset_email(email: str, token: str):
    FRONT_URL = os.getenv("FRONT_URL")

    reset_link = f"{FRONT_URL}/reset-password/{token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#060911;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060911;padding:40px 0;">
        <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;">

            <!-- TOP BADGE -->
            <tr>
                <td align="center" style="padding-bottom:24px;">
                <span style="
                    display:inline-block;
                    font-family:'Courier New',monospace;
                    font-size:13px;
                    letter-spacing:0.15em;
                    color:#38bdf8;
                    border:1px solid rgba(56,189,248,0.3);
                    background:rgba(56,189,248,0.07);
                    padding:6px 16px;
                    border-radius:4px;
                ">CERN LHCb — MONGOLIA 2026</span>
                </td>
            </tr>

            <!-- MAIN CARD -->
            <tr>
                <td style="
                background:rgba(6,10,22,0.95);
                border:1px solid rgba(56,189,248,0.16);
                border-radius:16px;
                overflow:hidden;
                ">

                <!-- HEADER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="
                        background:linear-gradient(135deg,#0f172a 0%,#0c1a3a 50%,#0f172a 100%);
                        padding:40px 40px 36px;
                        border-bottom:1px solid rgba(56,189,248,0.16);
                        text-align:center;
                    ">
                        <div style="
                        width:12px;height:12px;border-radius:50%;
                        background:#38bdf8;
                        box-shadow:0 0 20px 6px rgba(56,189,248,0.6);
                        margin:0 auto 20px;
                        display:block;
                        "></div>

                        <h1 style="
                        margin:0 0 10px;
                        font-size:26px;
                        font-weight:700;
                        color:#ffffff;
                        letter-spacing:-0.02em;
                        line-height:1.2;
                        ">Password Reset Request</h1>

                        <p style="
                        margin:0;
                        font-size:13px;
                        color:#94a3b8;
                        font-family:'Courier New',monospace;
                        letter-spacing:0.08em;
                        ">MONGOLIA - CERN LHCb 2026 CONFERENCE · ULAANBAATAR</p>
                    </td>
                    </tr>
                </table>

                <!-- BODY -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:36px 40px;">

                        <p style="
                        margin:0 0 8px;
                        font-size:13px;
                        font-family:'Courier New',monospace;
                        color:#38bdf8;
                        letter-spacing:0.12em;
                        ">ACCOUNT SECURITY</p>

                        <h2 style="
                        margin:0 0 20px;
                        font-size:20px;
                        font-weight:700;
                        color:#ffffff;
                        ">Reset Your Password</h2>

                        <p style="
                        margin:0 0 28px;
                        font-size:15px;
                        color:#94a3b8;
                        line-height:1.7;
                        ">
                        We received a request to reset the password for your
                        conference account. Click the button below to create
                        a new password and regain access.
                        </p>

                        <!-- RESET BUTTON -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                            <td align="center">
                            <a href="{reset_link}" style="
                                display:inline-block;
                                background:linear-gradient(135deg,#1d4ed8,#2563eb);
                                color:#ffffff;
                                text-decoration:none;
                                padding:16px 40px;
                                border-radius:10px;
                                font-size:15px;
                                font-weight:700;
                                letter-spacing:0.04em;
                                border:1px solid rgba(56,189,248,0.3);
                            ">Reset Password →</a>
                            </td>
                        </tr>
                        </table>

                        <!-- EXPIRY NOTICE -->
                        <div style="
                        background:rgba(56,189,248,0.05);
                        border:1px solid rgba(56,189,248,0.18);
                        border-left:3px solid #38bdf8;
                        border-radius:0 10px 10px 0;
                        padding:16px 20px;
                        margin-bottom:28px;
                        ">
                        <p style="
                            margin:0 0 6px;
                            font-size:13px;
                            font-family:'Courier New',monospace;
                            color:#38bdf8;
                            letter-spacing:0.08em;
                        ">⏱ EXPIRES IN 15 MINUTES</p>
                        <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                            This link will expire shortly for your security.
                            If you did not request a password reset, you can
                            safely ignore this email — your account remains secure.
                        </p>
                        </div>

                        <!-- LINK FALLBACK -->
                        <div style="
                        background:rgba(255,255,255,0.02);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:10px;
                        padding:18px 20px;
                        margin-bottom:28px;
                        ">
                        <p style="
                            margin:0 0 8px;
                            font-size:12px;
                            font-family:'Courier New',monospace;
                            color:#475569;
                            letter-spacing:0.08em;
                        ">IF BUTTON DOESN'T WORK, COPY THIS LINK:</p>
                        <a href="{reset_link}" style="
                            font-size:13px;
                            color:#38bdf8;
                            word-break:break-all;
                            line-height:1.6;
                        ">{reset_link}</a>
                        </div>

                        <!-- SIGN OFF -->
                        <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
                        Stay safe,<br>
                        <span style="color:#94a3b8;font-weight:600;">CERN LHCb — Mongolia 2026 Event Team</span>
                        </p>

                    </td>
                    </tr>
                </table>

                <!-- ENERGY BAR -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:0 40px;">
                        <div style="
                        height:2px;
                        border-radius:2px;
                        background:linear-gradient(90deg,#38bdf8,#f472b6,#34d399);
                        opacity:0.3;
                        "></div>
                    </td>
                    </tr>
                </table>

                <!-- FOOTER -->
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                    <td style="padding:24px 40px;text-align:center;">
                        <p style="
                        margin:0;
                        font-size:12px;
                        font-family:'Courier New',monospace;
                        color:#334155;
                        letter-spacing:0.06em;
                        ">
                        AUTOMATED NOTIFICATION — DO NOT REPLY<br>
                        © 2026 MONGOLIA - CERN LHCb 2026 CONFERENCE
                        </p>
                    </td>
                    </tr>
                </table>

                </td>
            </tr>

            </table>
        </td>
        </tr>
    </table>

    </body>
    </html>
    """

    await send_email(
        to=[email],
        subject="Reset Your Password | CERN LHCb - Mongolia 2026",
        html_body=html_body
    )    


# ---- TEST FUNCTIONS ---- #

@app.get("/test-all-emails", response_model=List[EmailSchema])
def get_mail_list(session: SessionDep, current_user: dict = Depends(require_role("admin"))):
    return session.exec(select(MailList)).all()

