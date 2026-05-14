from pydantic import BaseModel, EmailStr

class UserModel(BaseModel):
    title: str 
    firstname: str 
    lastname: str 
    email: EmailStr
    password: str 
    role: str 

class UserReturn(BaseModel):
    id: int
    title: str 
    firstname: str 
    lastname: str 
    email: EmailStr
    role: str 

class EventModel(BaseModel):
    date: str 
    start_time: str 
    end_time: str 
    topic: str 
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
    speaker_id: int 
    question: str 
    time: str 