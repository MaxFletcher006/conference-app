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
  event_name: string
  description?: string
  location?: string
  start_date: string
  end_date: string
  is_active: boolean
  ticket_price: number
  include_weekends: boolean
}

export interface Agenda {
  agenda_id: number
  event_id: number
  agenda?: string
  speaker?: string
  location?: string
  building?: string
  room?: string
  date?: string
  start_time?: string
  end_time?: string
}

export interface Banner {
  id: number
  event_id?: number
  description: string
  image_url?: string
  is_active: boolean
  created_at: string
  event_name?: string
  start_date?: string
  end_date?: string
  ticket_price?: number
}

export interface Post {
  id: number
  user_id: number | null
  time: string
  header: string
  body: string
  staff_only: boolean
}

export interface PostPayload {
  header: string
  body: string
  staff_only: boolean
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
  event_name: string
  description?: string
  location?: string
  start_date: string
  end_date: string
  is_active: boolean
  ticket_price: number
  include_weekends: boolean
}

export interface AgendaPayload {
  event_id: number
  agenda: string
  speaker?: string
  location: string
  building: string
  room: string
  date?: string
  start_time: string
  end_time: string
}

export interface AgendaUpdatePayload {
  agenda?: string
  speaker?: string
  location?: string
  building?: string
  room?: string
  date?: string
  start_time?: string
  end_time?: string
}

export interface BannerPayload {
  event_id?: number
  description: string
  image_url?: string
  is_active: boolean
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
  user_id: number
  entry_day: number
  used_times: number
}

export interface TicketValidation {
  ticket_uuid: string
  user_id: number
  validated_user: string
  validation_time: string
  attendee_name?: string
}

// ─── ERROR HELPER ─────────────────────────────────────────────────────────────
export const apiErr = (err: any, fallback = 'Request failed'): string => {
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) {
    const msgs = detail.map((d: any) => (typeof d === 'string' ? d : d?.msg ?? String(d)))
    return msgs.filter(Boolean).join('; ') || fallback
  }
  if (typeof detail === 'string' && detail) return detail
  if (detail && typeof detail === 'object' && typeof detail.msg === 'string') return detail.msg
  return fallback
}

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

export const serverTest = () => client.get<{ message: string }>('/').then(r => r.data)

export const getAllUsers = () => client.get<User[]>('/all-users').then(r => r.data)
export const getUser = (id: number) => client.get<User>(`/user/${id}`).then(r => r.data)
export const register = (payload: UserCreatePayload) => client.post<User>('/register', payload).then(r => r.data)

export const login = async (email: string, password: string) => {
  const data = await client.post<User & { token: string }>('/login', { email, password }).then(r => r.data)
  localStorage.setItem('token', data.token)
  return data
}
export const logout = () => {
  localStorage.removeItem('token')
  return client.post<{ message: string }>('/logout').then(r => r.data)
}

export const updateUser = (id: number, payload: Partial<UserCreatePayload>) => client.put<User>(`/user/${id}`, payload).then(r => r.data)
export const deleteUser = (id: number) => client.delete<{ message: string }>(`/user/${id}`).then(r => r.data)

// Events (authenticated)
export const getAllEvents = () => client.get<Event[]>('/all-events').then(r => r.data)
export const getPublicEvents = () => client.get<Event[]>('/public/events').then(r => r.data)
export const getPublicAllEvents = () => client.get<Event[]>('/public/all-events').then(r => r.data)
export const getEvent = (id: number) => client.get<Event>(`/event/${id}`).then(r => r.data)
export const createEvent = (payload: EventPayload) => client.post<Event>('/create-event', payload).then(r => r.data)
export const updateEvent = (id: number, payload: Partial<EventPayload>) => client.put<Event>(`/event/${id}`, payload).then(r => r.data)
export const deleteEvent = (id: number) => client.delete<{ status: boolean; message: string }>(`/event/${id}`).then(r => r.data)

// Agendas
export const getEventAgendas = (eventId: number) => client.get<Agenda[]>(`/event/${eventId}/agendas`).then(r => r.data)
export const createAgenda = (payload: AgendaPayload) => client.post<Agenda>('/agenda/create', payload).then(r => r.data)
export const updateAgenda = (agendaId: number, payload: AgendaUpdatePayload) => client.put<Agenda>(`/agenda/${agendaId}`, payload).then(r => r.data)
export const deleteAgenda = (agendaId: number) => client.delete<{ status: boolean; message: string }>(`/agenda/${agendaId}`).then(r => r.data)

// Banners
export const getPublicBanners = () => client.get<Banner[]>('/public/banners').then(r => r.data)
export const getAllBanners = () => client.get<Banner[]>('/banners').then(r => r.data)
export const createBanner = (payload: BannerPayload) => client.post<Banner>('/banners', payload).then(r => r.data)
export const updateBanner = (id: number, payload: BannerPayload) => client.put<Banner>(`/banners/${id}`, payload).then(r => r.data)
export const deleteBanner = (id: number) => client.delete<{ message: string }>(`/banners/${id}`).then(r => r.data)

// Tickets
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
  event_id?: number
}

export interface InvoiceResult {
  invoice_url?: string
  error?: string
}

export const createInvoice = (payload: InvoicePayload) =>
  client.post<InvoiceResult>('/invoice', payload).then(r => r.data)

export const checkUserTicket = () =>
  client.get<{ has_ticket: boolean; ticket_event_ids: number[] }>('/ticket/check').then(r => r.data)

export interface TicketAdmin {
  id: string
  user_id: number
  event_id: number | null
  event_name: string | null
  name: string
  day_length: number
  used_times: number
  qr_code_data: string
  firstname: string
  lastname: string
  email: string
}

export const getAllTickets = () =>
  client.get<TicketAdmin[]>('/admin/tickets').then(r => r.data)

export const adminIssueTicket = (userId: number, eventId?: number) =>
  client.post<{ message: string }>(`/admin/ticket/issue/${userId}${eventId ? `?event_id=${eventId}` : ''}`).then(r => r.data)

export const adminDeleteTicket = (userId: number) =>
  client.delete<{ message: string }>(`/admin/ticket/${userId}`).then(r => r.data)

export const getAllPosts = () =>
  client.get<Post[]>('/all-posts').then(r => r.data)

export const createPost = (payload: PostPayload) =>
  client.post<Post>('/create-post', payload).then(r => r.data)

export const deletePost = (postId: number) =>
  client.delete<{ message: string }>(`/delete-post/${postId}`).then(r => r.data)

export interface StaffTicketPayload {
  firstname: string
  lastname: string
  phone_number: string
  email: string
  event_id: number
}

export const staffCreateTicket = (payload: StaffTicketPayload) =>
  client.post<{ invoice_url?: string; email?: string; amount?: number; error?: string }>('/staff/ticket/create', payload).then(r => r.data)
