import type { Conversation, Message, CreateConversationPayload } from "../types/chat";

const API_BASE = "/api";

function getAuthHeaders(token?: string | null) {
  const accessToken = token ?? localStorage.getItem("auth_token");
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

export async function fetchConversations(token?: string | null): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: "GET",
    headers: getAuthHeaders(token),
    credentials: "include",
  });

  return handleJsonResponse<Conversation[]>(response);
}

export async function createOrGetConversation(
  payload: CreateConversationPayload,
  token?: string | null
): Promise<Conversation> {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: "POST",
    headers: getAuthHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return handleJsonResponse<Conversation>(response);
}

export async function fetchMessages(
  conversationId: number,
  token?: string | null
): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages/`, {
    method: "GET",
    headers: getAuthHeaders(token),
    credentials: "include",
  });

  return handleJsonResponse<Message[]>(response);
}
