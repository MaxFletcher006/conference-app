import axios from 'axios'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,  
})

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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

export interface QuestionWithUser {
  id: number
  user_id: number
  event_id: number
  question: string
  time: string
  fullname: string
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

export interface TicketVerification {
  ticket_uuid: string
  username: string
  day_left: number
}

export interface TicketValidation {
  ticket_uuid: string
  user_id: number
  validated_user: string
  validation_time: string
}

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

export const serverTest = () => client.get<{ message: string }>('/').then(r => r.data)

export const getAllUsers = () => client.get<User[]>('/all-users').then(r => r.data)
export const getUser = (id: number) => client.get<User>(`/user/${id}`).then(r => r.data)
export const register = (payload: UserCreatePayload) => client.post<User>('/register', payload).then(r => r.data)

export const login = async (email: string, password: string) => {
  const data = await client.post<User & { token: string }>('/login', { email, password }).then(r => r.data)
  localStorage.setItem('token', data.token)  // ← save token
  return data
}
export const logout = () => {
  localStorage.removeItem('token')  // ← clear token
  return client.post<{ message: string }>('/logout').then(r => r.data)
}

export const updateUser = (id: number, payload: Partial<UserCreatePayload>) => client.put<User>(`/user/${id}`, payload).then(r => r.data)
export const deleteUser = (id: number) => client.delete<{ message: string }>(`/user/${id}`).then(r => r.data)

export const getAllEvents = () => client.get<Event[]>('/all-events').then(r => r.data)
export const getEvent = (id: number) => client.get<Event>(`/event/${id}`).then(r => r.data)
export const createEvent = (payload: EventPayload) => client.post<Event>('/add-event', payload).then(r => r.data)
export const updateEvent = (id: number, payload: Partial<EventPayload>) => client.put<Event>(`/event/${id}`, payload).then(r => r.data)
export const deleteEvent = (id: number) => client.delete<{ status: boolean; message: string }>(`/event/${id}`).then(r => r.data)

export const purchaseTicket = (payload: TicketPurchasePayload) => client.post<TicketPurchaseResult>('/purchase_ticket', payload).then(r => r.data)
export const validateTicket = (ticketUuid: string) => client.get<TicketVerification>(`/validate/${ticketUuid}`).then(r => r.data)
export const ticketValidation = (ticket: TicketValidation) => client.post<TicketValidation>('/ticket/validation', ticket).then(r => r.data)
export const getValidations = () => client.get<TicketValidation[]>('/ticket/get-validations').then((r) => r.data)

export interface ValidationFull {
  val_id: number
  ticket_uuid: string
  validated_user: string
  staff_name: string
  staff_id: number
  validation_time: string
}

export interface TransactionFull {
  id: number
  user_id: number
  username: string
  amount: number
  transaction_id: number
  created_at: string
  description: string
  url: string
}

export const getValidationsFull = () => client.get<ValidationFull[]>('/ticket/get-validations-full').then(r => r.data)
export const getAllTransactions = () => client.get<TransactionFull[]>('/all-transactions').then(r => r.data)
export const getTotalTickets = () => client.get('/tickets').then((r) => r.data)
export const getTicketSummary = () => client.get<{ user_ids: number[] }>('/tickets/summary').then(r => r.data)

export const getAllQuestions = () => client.get<Question[]>('/all-questions').then(r => r.data)
export const addQuestion = (payload: QuestionPayload) => client.post<Question>('/add-question', payload).then(r => r.data)
export const getQuestionsByUser = (userId: number) => client.get<Question[]>(`/question/${userId}`).then(r => r.data)
export const getAllQuestionsWithUsers = () =>
  client.get<QuestionWithUser[]>('/all-questions-with-users').then(r => r.data)

export const getAllEmails = () => client.get<EmailEntry[]>('/test-all-emails').then(r => r.data)

export const forgotPassword = (email: string) =>
  client.post<{ message: string }>('/forgot', { email }).then(r => r.data)

export const resetPassword = (token: string, new_password: string) =>
  client.post<{ message: string }>('/reset-password', { token, new_password }).then(r => r.data)

export interface InvoicePayload {
  user_id: number
  username: string
  amount: number
  days: number
}

export interface InvoiceResult {
  invoice_url?: string
  error?: string
}

export const createInvoice = (payload: InvoicePayload) =>
  client.post<InvoiceResult>('/invoice', payload).then(r => r.data)

export const checkUserTicket = () =>
  client.get<{ has_ticket: boolean }>('/ticket/check').then(r => r.data)