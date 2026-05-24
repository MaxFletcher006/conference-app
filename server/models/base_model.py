from pydantic import BaseModel, EmailStr
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
    date: str 
    start_time: str 
    end_time: str 
    topic: str 
    agenda: str
    speaker: str
    location: str 
    building: str 
    room: str 

'''
class PostModel(BaseModel):
    user_id: int
    time: str  
    header: str 
    body: str
'''

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

class InvoiceModel(BaseModel):
    user_id: int
    username: str
    amount: int
    days: int