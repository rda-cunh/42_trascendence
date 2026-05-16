import type { Conversation, Message, CreateConversationPayload } from "../types/chat";

const API_BASE = "/api";

function getAuthHeaders() {
  const accessToken = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken && accessToken !== "undefined" && accessToken !== "null") {
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

function normalizeConversation(item: any): Conversation {
  return {
    id: Number(item?.id),
    listing_id: Number(item?.listing_id),
    buyer_id: Number(item?.buyer_id),
    seller_id: Number(item?.seller_id),
    last_message: item?.last_message ?? null,
    last_message_at: item?.last_message_at ?? null,
    created_at: item?.created_at ?? undefined,
    listing_name: item?.listing_name ?? item?.listing?.name ?? null,
    listing_image_hash: item?.listing_image_hash ?? item?.listing?.image_hash ?? null,
    listing_price: item?.listing_price ?? item?.listing?.price ?? null,
    other_id: item?.other_id ?? null,
    other_user: item?.other_user ?? null,
  };
}

function sortConversationsByNewest(conversations: Conversation[]) {
  return [...conversations].sort((a, b) => {
    const aTime = a.last_message_at ?? a.created_at ?? "";
    const bTime = b.last_message_at ?? b.created_at ?? "";
    return bTime.localeCompare(aTime);
  });
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleJsonResponse<any[]>(response);
  return sortConversationsByNewest((Array.isArray(data) ? data : []).map(normalizeConversation));
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

  const data = await handleJsonResponse<any>(response);
  return normalizeConversation(data);
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  return handleJsonResponse<Message[]>(response);
}