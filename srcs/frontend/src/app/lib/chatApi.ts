import type { Conversation, Message, CreateConversationPayload } from "../types/chat";

const API_BASE = "/api";

// always read the token from localStorage at request time. AuthContext keeps localStorage in sync on login, register, etc.
function getAuthHeaders() {
  const accessToken = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = await response.text();
    }
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorBody)}`
    );
  }
  return response.json() as Promise<T>;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  return handleJsonResponse<Conversation[]>(response);
}

export async function createOrGetConversation(
  payload: CreateConversationPayload
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleJsonResponse<Conversation>(response);
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  return handleJsonResponse<Message[]>(response);
}
