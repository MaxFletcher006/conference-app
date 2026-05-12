from pydantic import BaseModel, EmailStr

class AttendeeModel(BaseModel):
    title: str 
    firstname: str 
    lastname: str 
    email: EmailStr
    role: str 

class UserModel(BaseModel):
    username: str 
    password: str 
    attendee_id: int 

class EventModel(BaseModel):
    date: str 
    start_time: str 
    end_time: str 
    topic: str 
    speaker: int
    location: str 
    building: str 
    room: str 