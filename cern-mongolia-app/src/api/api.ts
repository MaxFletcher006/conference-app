import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

const URL = process.env.URL;

const client = axios.create({
  baseURL: URL,
  withCredentials: true, // required for session cookie auth
});

// ---- TYPES ---- //

export interface User {
  id: number;
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}

export interface Event {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  agenda: string;
  speaker: number;
  location: string;
  building: string;
  room: string;
}

export interface Question {
  user_id: number;
  speaker_id: number;
  question: string;
  time: string;
}

export interface EmailEntry {
  email: string;
}

export interface TicketPurchasePayload {
  user_id: number;
  day: number;
  email: string;
}

export interface TicketPurchaseResult {
  status: string;
  ticket_id: string;
}

export interface TicketValidationResult {
  status: "valid" | "expired";
  detail: string;
  remaining_entries?: number;
}

export interface UserCreatePayload {
  title: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
}

export interface EventPayload {
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  agenda: string;
  speaker: number;
  location: string;
  building: string;
  room: string;
}

export interface QuestionPayload {
  user_id: number;
  speaker_id: number;
  question: string;
  time: string;
}

// ---- SERVER ---- //

export async function serverTest(): Promise<{ message: string }> {
  const response = await client.get<{ message: string }>("/");
  return response.data;
}

// ---- USER ---- //

export async function getAllUsers(): Promise<User[]> {
  const response = await client.get<User[]>("/all-users");
  return response.data;
}

export async function getUser(id: number): Promise<User> {
  const response = await client.get<User>(`/user/${id}`);
  return response.data;
}

export async function register(payload: UserCreatePayload): Promise<User> {
  const response = await client.post<User>("/register", payload);
  return response.data;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await client.post<User>("/login", { email, password });
  return response.data;
}

export async function logout(): Promise<{ message: string }> {
  const response = await client.post<{ message: string }>("/logout");
  return response.data;
}

export async function updateUser(
  id: number,
  payload: Partial<UserCreatePayload>
): Promise<User> {
  const response = await client.put<User>(`/user/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const response = await client.delete<{ message: string }>(`/user/${id}`);
  return response.data;
}

// ---- EVENT ---- //

export async function getAllEvents(): Promise<Event[]> {
  const response = await client.get<Event[]>("/all-events");
  return response.data;
}

export async function getEvent(id: number): Promise<Event> {
  const response = await client.get<Event>(`/event/${id}`);
  return response.data;
}

export async function createEvent(payload: EventPayload): Promise<Event> {
  const response = await client.post<Event>("/add-event", payload);
  return response.data;
}

export async function updateEvent(
  eventId: number,
  payload: Partial<EventPayload>
): Promise<Event> {
  const response = await client.put<Event>(`/event/${eventId}`, payload);
  return response.data;
}

export async function deleteEvent(
  eventId: number
): Promise<{ status: boolean; message: string }> {
  const response = await client.delete<{ status: boolean; message: string }>(
    `/event/${eventId}`
  );
  return response.data;
}

// ---- TICKET ---- //

export async function purchaseTicket(
  payload: TicketPurchasePayload
): Promise<TicketPurchaseResult> {
  const response = await client.post<TicketPurchaseResult>(
    "/purchase_ticket",
    payload
  );
  return response.data;
}

export async function validateTicket(
  ticketUuid: string
): Promise<TicketValidationResult> {
  const response = await client.get<TicketValidationResult>(
    `/validate/${ticketUuid}`
  );
  return response.data;
}

// ---- QUESTION ---- //

export async function getAllQuestions(): Promise<Question[]> {
  const response = await client.get<Question[]>("/all-questions");
  return response.data;
}

export async function addQuestion(
  payload: QuestionPayload
): Promise<Question> {
  const response = await client.post<Question>("/add-question", payload);
  return response.data;
}

export async function getQuestionsBySpeaker(
  speakerId: number
): Promise<Question[]> {
  const response = await client.get<Question[]>(`/question/${speakerId}`);
  return response.data;
}

// ---- MAIL (admin only) ---- //

export async function getAllEmails(): Promise<EmailEntry[]> {
  const response = await client.get<EmailEntry[]>("/test-all-emails");
  return response.data;
}