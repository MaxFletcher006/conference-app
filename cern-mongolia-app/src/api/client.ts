import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
console.log(BASE_URL);

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  firstname: string
  lastname: string
  email: string
  phone_number: string
  role: 'admin' | 'supervisor' | 'staff' | 'attendee'
}

export interface Event {
  id: number
  date: string
  start_time: string
  end_time: string
  topic: string
  agenda: string
  speaker: string
  location: string
  building: string
  room: string
}

export interface Question {
  user_id: number
  event_id: number      
  question: string
  time: string
}

export interface EmailEntry {
  email: string
}

export interface TicketPurchasePayload {
  user_id: number
  day: number
  email: string
}

export interface TicketPurchaseResult {
  status: string
  ticket_id: string
}

export interface TicketValidationResult {
  status: 'valid' | 'expired'
  detail: string
  remaining_entries?: number
}

export interface UserCreatePayload {
  firstname: string
  lastname: string
  email: string
  password: string
  role: string
  phone_number: string
}

export interface EventPayload {
  date: string
  start_time: string
  end_time: string
  topic: string
  agenda: string
  speaker: string
  location: string
  building: string
  room: string
}

export interface QuestionPayload {
  user_id: number
  event_id: number     
  question: string
  time: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  new_password: string
}

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

export const serverTest = () => client.get<{ message: string }>('/').then(r => r.data)

export const getAllUsers = () => client.get<User[]>('/all-users').then(r => r.data)
export const getUser = (id: number) => client.get<User>(`/user/${id}`).then(r => r.data)
export const register = (payload: UserCreatePayload) => client.post<User>('/register', payload).then(r => r.data)
export const login = (email: string, password: string) => client.post<User>('/login', { email, password }).then(r => r.data)
export const logout = () => client.post<{ message: string }>('/logout').then(r => r.data)
export const updateUser = (id: number, payload: Partial<UserCreatePayload>) => client.put<User>(`/user/${id}`, payload).then(r => r.data)
export const deleteUser = (id: number) => client.delete<{ message: string }>(`/user/${id}`).then(r => r.data)

export const getAllEvents = () => client.get<Event[]>('/all-events').then(r => r.data)
export const getEvent = (id: number) => client.get<Event>(`/event/${id}`).then(r => r.data)
export const createEvent = (payload: EventPayload) => client.post<Event>('/add-event', payload).then(r => r.data)
export const updateEvent = (id: number, payload: Partial<EventPayload>) => client.put<Event>(`/event/${id}`, payload).then(r => r.data)
export const deleteEvent = (id: number) => client.delete<{ status: boolean; message: string }>(`/event/${id}`).then(r => r.data)

export const purchaseTicket = (payload: TicketPurchasePayload) => client.post<TicketPurchaseResult>('/purchase_ticket', payload).then(r => r.data)
export const validateTicket = (ticketUuid: string) => client.get<TicketValidationResult>(`/validate/${ticketUuid}`).then(r => r.data)

export const getAllQuestions = () => client.get<Question[]>('/all-questions').then(r => r.data)
export const addQuestion = (payload: QuestionPayload) => client.post<Question>('/add-question', payload).then(r => r.data)
export const getQuestionsByUser = (userId: number) => client.get<Question[]>(`/question/${userId}`).then(r => r.data)

export const getAllEmails = () => client.get<EmailEntry[]>('/test-all-emails').then(r => r.data)

export const forgotPassword = (email: string) =>
  client.post<{ message: string }>('/forgot', { email }).then(r => r.data)

export const resetPassword = (token: string, new_password: string) =>
  client.post<{ message: string }>('/reset-password', { token, new_password }).then(r => r.data)