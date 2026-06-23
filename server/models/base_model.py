from pydantic import BaseModel, EmailStr
from typing import Optional
from models.model import User, Validation

class UserModel(BaseModel):
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: str
    password: str
    role: str

class UserReturn(BaseModel):
    id: int
    firstname: str
    lastname: str
    email: EmailStr
    phone_number: str
    role: str

class EventModel(BaseModel):
    event_name: str
    description: Optional[str] = None
    start_date: str
    end_date: str
    is_active: bool = False
    ticket_price: float
    include_weekends: bool = False

class AgendaModel(BaseModel):
    event_id: int
    agenda: str
    speaker: Optional[str] = None
    location: str
    building: str
    room: str
    start_time: str
    end_time: str

class AgendaUpdate(BaseModel):
    agenda: Optional[str] = None
    speaker: Optional[str] = None
    location: Optional[str] = None
    building: Optional[str] = None
    room: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class BannerModel(BaseModel):
    event_id: Optional[int] = None
    description: str
    is_active: bool = False

class BannerReturn(BaseModel):
    id: int
    event_id: Optional[int] = None
    description: str
    is_active: bool
    created_at: str
    event_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    ticket_price: Optional[float] = None

class PostCreate(BaseModel):
    header: str
    body: str
    staff_only: bool = False

class PostReturn(BaseModel):
    id: int
    user_id: int | None
    time: str
    header: str
    body: str
    staff_only: bool

class QuestionModel(BaseModel):
    user_id: int
    event_id: int
    question: str
    time: str

class QuestionWithUser(BaseModel):
    id: int
    user_id: int
    event_id: int
    question: str
    time: str
    fullname: str

class UserQuestion(BaseModel):
    user_id: int

class EmailSchema(BaseModel):
    email: EmailStr

class TicketPurchaseModel(BaseModel):
    user_id: int
    day: int
    email: EmailStr
    price: float

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class ForgetEmail(BaseModel):
    email: str

class PasswordReset(BaseModel):
    token: str
    new_password: str

class TicketVerification(BaseModel):
    ticket_uuid: str
    username: str
    user_id: int
    entry_day: int
    used_times: int

class TicketValidation(BaseModel):
    ticket_uuid: str
    user_id: int
    validated_user: str
    validation_time: str
    attendee_name: str = ""

class InvoiceModel(BaseModel):
    user_id: int
    username: str
    amount: int
    event_id: Optional[int] = None

class UserUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    phone_number: Optional[str] = None

class StaffTicketCreate(BaseModel):
    firstname: str
    lastname: str
    phone_number: str
    email: EmailStr
    event_id: int
