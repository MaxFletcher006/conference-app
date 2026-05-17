from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, Session
from typing import Annotated, List
from contextlib import asynccontextmanager
from sqlalchemy.exc import IntegrityError
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from starlette.responses import JSONResponse
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv

from models.model import User, Event, Ticket, MailList, Question, create_db_and_tables, get_session
from models.base_model import UserModel, EventModel, UserReturn, QuestionModel, EmailSchema, TicketPurchaseModel, LoginModel, PasswordReset, ForgetEmail, UserQuestion
from mailer import conf 
from uuid import uuid4
from datetime import datetime, timedelta, timezone

import bcrypt, io, os
import qrcode
import jwt

load_dotenv()

# --- SESSION CONTROL ---- #

SESSION_SECRET = os.getenv("SESSION_SECRET")
if not SESSION_SECRET:
    raise RuntimeError("SESSION_SECRET is not set in environment")
SESSION_COOKIE = "session"
SESSION_MAX_AGE = 60 * 60 * 24 * 7

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
        "https://conference-app-fawn.vercel.app/",
        "http://localhost:5173",
    ],

    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
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
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        password_match = bcrypt.checkpw(
            login_data.password.encode("utf-8"),
            db_user.password.encode("utf-8")
        )

        if not password_match:
            raise HTTPException(
                status_code=401,
                detail="Email or password doesn't match"
            )

        token = create_session_cookie({"user_id": db_user.id, "role": db_user.role})
        response.set_cookie(
            key=SESSION_COOKIE,
            value=token,
            httponly=True,
            samesite="none",
            secure=True,
            max_age=SESSION_MAX_AGE
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
    
@app.post("/forgot")
async def password_forgot(session: SessionDep, data: ForgetEmail, background_tasks: BackgroundTasks):
    try:
        db_user = session.exec(
            select(User).where(User.email == data.email)
        ).first()

        if db_user:
            token = create_reset_token(db_user.email)
            await send_reset_email(db_user.email, token)        
        return {"message": "Reset password link has sent to email"}
    
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@app.post("/reset-password")
def password_reset(session: SessionDep, data: PasswordReset):

    RESET_SECRET_KEY = os.getenv("RESET_SECRET_KEY")
    RESET_ALGORITHM = os.getenv("RESET_ALGORITHM")

    print(RESET_SECRET_KEY)
    print(RESET_ALGORITHM)

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
def update_user(session: SessionDep, id: int, current_user: UserModel, user_info: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))):

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
        return session.exec(select(Event)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/event/{id}", response_model=Event)
def get_event(session: SessionDep, id: int, current_user: dict = Depends(require_role("admin", "supervisor"))):
    try:
        db_event = session.get(Event, id)
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
        
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event

@app.post("/add-event", response_model=Event)
async def create_event(event: EventModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor"))):
    db_event = Event.model_validate(event)
    try:
        session.add(db_event)
        session.commit()
        session.refresh(db_event)

        email_list = get_mail_list(session=session)
        await publish_event(type="created", db_event=db_event, email_list=email_list)

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

        email_list = get_mail_list(session=session)
        await publish_event(type="updated", db_event=db_event, email_list=email_list)

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

        email_list = get_mail_list(session=session)
        await publish_event(type="cancelled", db_event=db_event, email_list=email_list)

        session.delete(db_event)
        session.commit()
        return {"status": True, "message": "Event deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
# ---- TICKET FUNCTIONS ---- #

@app.post("/purchase_ticket")
async def purchase_ticket(data: TicketPurchaseModel, session: SessionDep, current_user: dict = Depends(require_role("admin", "supervisor", "staff", "attendee"))):

    FRONT_URL = os.getenv("FRONT_URL")

    user = get_user(session=session, id=data.user_id)

    ticket_uuid = str(uuid4())

    UPLOAD_DIR = "tickets"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
    
    new_ticket = Ticket(
        user_id=data.user_id,
        name="Conference Pass",
        day_length=data.day,
        used_times=0,
        qr_code_data=ticket_uuid 
    )
    session.add(new_ticket)
    session.commit()
    session.refresh(new_ticket)

    qr_buffer = generate_qr_buffer(f'{FRONT_URL}/validate/{new_ticket.qr_code_data}')

    file_name = f"ticket_{ticket_uuid}.png"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as f:
        f.write(qr_buffer.getvalue())

    message = MessageSchema(
        subject="CERN LHCb - Mongolia 2026 | Ticket",
        recipients=[data.email],
        subtype=MessageType.html,
        body=f"""
        <html>
        <body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 0;">

                        <table width="600" cellpadding="0" cellspacing="0"
                            style="background:white;border-radius:16px;
                            overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                            <!-- Header -->
                            <tr>
                                <td align="center"
                                    style="background:#111827;padding:30px;color:white;">
                                    <h1 style="margin:0;font-size:28px;">
                                        CERN Mongolia 2026 | Event Ticket
                                    </h1>
                                    <p style="margin-top:10px;color:#d1d5db;">
                                        Thank you for purchasing event 
                                    </p>
                                </td>
                            </tr>

                            <!-- Body -->
                            <tr>
                                <td style="padding:40px;color:#374151;">

                                    <h2 style="margin-top:0;">
                                        Dear {user.firstname} {user.lastname},
                                    </h2>

                                    <p style="font-size:16px;line-height:1.6;">
                                        Your ticket has been successfully generated.
                                        Please present the attached QR code at the entrance.
                                    </p>

                                    <div style="
                                        margin:30px 0;
                                        padding:20px;
                                        background:#f9fafb;
                                        border-left:4px solid #2563eb;
                                        border-radius:8px;
                                    ">
                                        <p style="margin:0;font-size:15px;">
                                            📌 Important:
                                            Each QR ticket can only be used according
                                            to its allowed entry count.
                                        </p>
                                    </div>

                                    <p style="font-size:16px;line-height:1.6;">
                                        We look forward to seeing you at the event.
                                    </p>

                                    <p style="margin-top:40px;">
                                        Best regards,<br>
                                        <strong>CERN Mongolia 2026 Event Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center"
                                    style="padding:20px;background:#f3f4f6;
                                    color:#6b7280;font-size:13px;">

                                    This is an automated email. Please do not reply.

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>
        </body>
        </html>
        """,
        attachments=[file_path]
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    return {"status": "purchased", "ticket_id": new_ticket.id}

@app.get("/validate/{ticket_uuid}")
def validate_ticket(session: SessionDep, ticket_uuid: str, current_user: dict = Depends(require_role("admin","supervisor","staff"))):
    try:
        db_ticket = session.exec(select(Ticket).where(Ticket.qr_code_data == ticket_uuid)).first()

        if not db_ticket:
            raise HTTPException(status_code=404, detail="Invalid ticket")
        
        if db_ticket.used_times >= db_ticket.day_length:
            return {"status": "expired", "detail": "Your ticket has been expired"}
        
        else:
            db_ticket.used_times += 1
        
        session.add(db_ticket)
        session.commit()
        session.refresh(db_ticket)

        return {
                "status": "valid",
                "detail": "Ticket validated",
                "remaining_entries":
                    db_ticket.day_length - db_ticket.used_times
            }    
    
    except HTTPException:
        raise

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
# ---- POST FUNCTIONS ---- #

'''
@app.get("/all-posts", response_model=List[PostModel])
def get_all_post(session: SessionDep):
    try:
        return session.exec(select(Post)).all()
    except Exception as e:
        print(f'Error: {e}')
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.post("/create-post")
async def create_post(session: SessionDep, data: PostModel):
    db_post = Post.model_validate(data)

    try: 
        session.add(db_post)
        session.commit()
        session.refresh(db_post)

        email_list = get_mail_list(session=session)
        await publish_post(type="created", db_post=db_post, email_list=email_list)

        return {"message": "Post successfully added"}
    
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error occured")

@app.put("/update-post/{post_id}")
async def update_post(post_id: int, data: PostModel, session: SessionDep):
    try:
        db_post = session.get(Post, post_id)
        if not db_post:
            raise HTTPException(status_code=404, detail="Post not found")

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_post, key, value)

        session.add(db_post)
        session.commit()
        session.refresh(db_post)

        email_list = get_mail_list(session=session)
        await publish_post(type="updated", db_post=db_post, email_list=email_list)

        return {"message": "Post successfully updated"}

    except HTTPException:
        raise

    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/cancel-post/{post_id}")
async def cancel_post(post_id: int, session: SessionDep):
    try:
        db_post = session.get(Post, post_id)
        if not db_post:
            raise HTTPException(status_code=404, detail="Post not found")

        email_list = get_mail_list(session=session)
        await publish_post(type="cancelled", db_post=db_post, email_list=email_list)

        session.delete(db_post)
        session.commit()

        return {"message": "Post successfully cancelled"}

    except HTTPException:
        raise

    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

'''
    
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

# ---- MAIL FUNCTIONS ---- #

async def mail_service(type: str, header: str, body: str, time: str, email: List[EmailSchema]):

    status = type.upper()

    if status == "CREATED":
        banner_color = "#16a34a"
        status_emoji = "🟢"
        status_text = "New Announcement"
    elif status == "UPDATED":
        banner_color = "#2563eb"
        status_emoji = "🔵"
        status_text = "Announcement Updated"
    elif status == "CANCELLED":
        banner_color = "#dc2626"
        status_emoji = "🔴"
        status_text = "Announcement Cancelled"
    else:
        banner_color = "#111827"
        status_emoji = "📢"
        status_text = "Announcement"

    message = MessageSchema(
        subject=f"{status} POST | CERN Mongolia 2026",
        recipients=[entry.email for entry in email],
        subtype=MessageType.html,
        body=f"""
        <html>
        <body style="
            margin:0;
            padding:0;
            background-color:#f3f4f6;
            font-family:Arial,sans-serif;
        ">

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <table width="600" cellpadding="0" cellspacing="0"
                            style="
                                background:white;
                                border-radius:18px;
                                overflow:hidden;
                                box-shadow:0 6px 20px rgba(0,0,0,0.08);
                            ">

                            <!-- HEADER -->
                            <tr>
                                <td align="center"
                                    style="
                                        background:{banner_color};
                                        padding:35px 30px;
                                        color:white;
                                    ">

                                    <h1 style="
                                        margin:0;
                                        font-size:30px;
                                        font-weight:bold;
                                    ">
                                        {status_emoji} {status_text}
                                    </h1>

                                    <p style="
                                        margin-top:12px;
                                        font-size:15px;
                                        color:#e5e7eb;
                                    ">
                                        CERN Mongolia 2026
                                    </p>

                                </td>
                            </tr>

                            <!-- BODY -->
                            <tr>
                                <td style="
                                    padding:40px;
                                    color:#374151;
                                ">

                                    <h2 style="
                                        margin-top:0;
                                        font-size:26px;
                                        color:#111827;
                                    ">
                                        {header}
                                    </h2>

                                    <div style="
                                        margin-top:25px;
                                        padding:24px;
                                        background:#f9fafb;
                                        border-radius:12px;
                                        border:1px solid #e5e7eb;
                                        line-height:1.8;
                                        font-size:16px;
                                        color:#374151;
                                        white-space:pre-line;
                                    ">
                                        {body}
                                    </div>

                                    <!-- TIME SECTION -->
                                    <div style="
                                        margin-top:25px;
                                        padding:20px;
                                        background:#f3f4f6;
                                        border-radius:12px;
                                        border:1px solid #d1d5db;
                                    ">
                                        <p style="
                                            margin:0;
                                            font-size:15px;
                                            color:#374151;
                                        ">
                                            🕒 <strong>Event Time:</strong> {time}
                                        </p>
                                    </div>

                                    <!-- NOTICE -->
                                    <div style="
                                        margin-top:30px;
                                        padding:18px;
                                        background:#eff6ff;
                                        border-left:4px solid {banner_color};
                                        border-radius:10px;
                                    ">
                                        <p style="
                                            margin:0;
                                            font-size:15px;
                                            color:#1f2937;
                                        ">
                                            📌 Please stay updated through official
                                            CERN Mongolia 2026 announcements.
                                        </p>
                                    </div>

                                    <p style="
                                        margin-top:40px;
                                        font-size:16px;
                                        line-height:1.7;
                                    ">
                                        Thank you,<br>
                                        <strong>CERN Mongolia 2026 Event Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td align="center"
                                    style="
                                        background:#f9fafb;
                                        padding:22px;
                                        font-size:13px;
                                        color:#6b7280;
                                    ">

                                    This is an automated email notification.<br>
                                    Please do not reply to this email.

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        """,
    )

    fm = FastMail(conf)
    await fm.send_message(message)

# ---- MISC FUNCTIONS ---- #

# async def publish_post(type: str, db_post: Post, email_list: List[EmailSchema]):
#     if not db_post:
#         raise HTTPException(status_code=404, detail="Post not found")
    
#     match type:
#         case "created":
#             await mail_service(type=type, header=db_post.header, body=db_post.body, time=db_post.time, email=email_list) 
#         case "updated":
#             await mail_service(type=type, header=db_post.header, body=db_post.body, time=db_post.time, email=email_list) 
#         case "cancelled":
#             await mail_service(type=type, header=db_post.header, body=db_post.body, time=db_post.time, email=email_list)

async def publish_event(type: str, db_event: Event, email_list: List[EmailSchema]):
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    event_body = f"📍 {db_event.location} — {db_event.building}, {db_event.room}"
    event_time = f"{db_event.date} | {db_event.start_time} – {db_event.end_time}"

    match type:
        case "created":
            await mail_service(type=type, header=db_event.topic, body=event_body, time=event_time, email=email_list)
        case "updated":
            await mail_service(type=type, header=db_event.topic, body=event_body, time=event_time, email=email_list)
        case "cancelled":
            await mail_service(type=type, header=db_event.topic, body=event_body, time=event_time, email=email_list)


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
    print(FRONT_URL)

    reset_link = f"{FRONT_URL}/reset-password/{token}"

    message = MessageSchema(
        subject="Reset Your Password | CERN LHCb - Mongolia 2026",
        recipients=[email],
        subtype=MessageType.html,
        body=f"""
        <html>
        <body style="
            margin:0;
            padding:0;
            background-color:#f3f4f6;
            font-family:Arial,sans-serif;
        ">

            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding:40px 20px;">

                        <table width="600" cellpadding="0" cellspacing="0"
                            style="
                                background:white;
                                border-radius:18px;
                                overflow:hidden;
                                box-shadow:0 6px 20px rgba(0,0,0,0.08);
                            ">

                            <!-- HEADER -->
                            <tr>
                                <td align="center"
                                    style="
                                        background:#2563eb;
                                        padding:35px 30px;
                                        color:white;
                                    ">

                                    <h1 style="
                                        margin:0;
                                        font-size:30px;
                                        font-weight:bold;
                                    ">
                                        Password Reset Request
                                    </h1>

                                    <p style="
                                        margin-top:12px;
                                        font-size:15px;
                                        color:#e5e7eb;
                                    ">
                                        CERN Mongolia 2026
                                    </p>

                                </td>
                            </tr>

                            <!-- BODY -->
                            <tr>
                                <td style="
                                    padding:40px;
                                    color:#374151;
                                ">

                                    <h2 style="
                                        margin-top:0;
                                        font-size:26px;
                                        color:#111827;
                                    ">
                                        Reset Your Password
                                    </h2>

                                    <div style="
                                        margin-top:25px;
                                        padding:24px;
                                        background:#f9fafb;
                                        border-radius:12px;
                                        border:1px solid #e5e7eb;
                                        line-height:1.8;
                                        font-size:16px;
                                        color:#374151;
                                    ">
                                        We received a request to reset your account password.
                                        Click the button below to create a new password.
                                    </div>

                                    <!-- BUTTON -->
                                    <div style="margin-top:35px; text-align:center;">

                                        <a href="{reset_link}"
                                            style="
                                                display:inline-block;
                                                background:#2563eb;
                                                color:white;
                                                text-decoration:none;
                                                padding:16px 34px;
                                                border-radius:12px;
                                                font-size:16px;
                                                font-weight:bold;
                                            ">
                                            Reset Password
                                        </a>

                                    </div>

                                    <!-- LINK -->
                                    <div style="
                                        margin-top:30px;
                                        padding:18px;
                                        background:#f3f4f6;
                                        border-radius:10px;
                                        font-size:14px;
                                        color:#4b5563;
                                        word-break:break-all;
                                    ">
                                        If the button does not work, copy and paste this link into your browser:
                                        <br><br>
                                        <a href="{reset_link}" style="color:#2563eb;">
                                            {reset_link}
                                        </a>
                                    </div>

                                    <!-- NOTICE -->
                                    <div style="
                                        margin-top:30px;
                                        padding:18px;
                                        background:#eff6ff;
                                        border-left:4px solid #2563eb;
                                        border-radius:10px;
                                    ">
                                        <p style="
                                            margin:0;
                                            font-size:15px;
                                            color:#1f2937;
                                        ">
                                            This password reset link will expire soon for security reasons.
                                            If you did not request a password reset, you can safely ignore this email.
                                        </p>
                                    </div>

                                    <p style="
                                        margin-top:40px;
                                        font-size:16px;
                                        line-height:1.7;
                                    ">
                                        Thank you,<br>
                                        <strong>CERN Mongolia 2026 Event Team</strong>
                                    </p>

                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td align="center"
                                    style="
                                        background:#f9fafb;
                                        padding:22px;
                                        font-size:13px;
                                        color:#6b7280;
                                    ">

                                    This is an automated email notification.<br>
                                    Please do not reply to this email.

                                </td>
                            </tr>

                        </table>

                    </td>
                </tr>
            </table>

        </body>
        </html>
        """,
    )

    fm = FastMail(conf)
    await fm.send_message(message)


# ---- TEST FUNCTIONS ---- #

@app.get("/test-all-emails", response_model=List[EmailSchema])
def get_mail_list(session: SessionDep, current_user: dict = Depends(require_role("admin"))):
    return session.exec(select(MailList)).all()