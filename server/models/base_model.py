from pydantic import BaseModel, EmailStr

class UserModel(BaseModel):
    firstname: str 
    lastname: str 
    email: EmailStr
    password: str 
    role: str 

class UserReturn(BaseModel):
    id: int
    firstname: str 
    lastname: str 
    email: EmailStr
    role: str 

class EventModel(BaseModel):
    date: str 
    start_time: str 
    end_time: str 
    topic: str 
    agenda: str
    speaker: int
    location: str 
    building: str 
    room: str 

class PostModel(BaseModel):
    user_id: int
    time: str  
    header: str 
    body: str

class QuestionModel(BaseModel):
    user_id: int 
    event_id: int 
    question: str 
    time: str 

class EmailSchema(BaseModel):
    email: EmailStr

class TicketPurchaseModel(BaseModel):
    user_id: int 
    day: int 
    email: EmailStr

class LoginModel(BaseModel):
    email: EmailStr
    password: str