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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeConversation(item: unknown): Conversation {
  const record = isRecord(item) ? item : {};
  const listing = isRecord(record.listing) ? record.listing : {};
  const otherUser = isRecord(record.other_user) ? record.other_user : null;

  return {
    id: Number(record.id),
    listing_id: Number(record.listing_id),
    buyer_id: Number(record.buyer_id),
    seller_id: Number(record.seller_id),
    last_message: typeof record.last_message === "string" ? record.last_message : null,
    last_message_at: typeof record.last_message_at === "string" ? record.last_message_at : null,
    created_at: typeof record.created_at === "string" ? record.created_at : undefined,
    listing_name:
      typeof record.listing_name === "string"
        ? record.listing_name
        : typeof listing.name === "string"
          ? listing.name
          : null,
    listing_image_hash:
      typeof record.listing_image_hash === "string"
        ? record.listing_image_hash
        : typeof listing.image_hash === "string"
          ? listing.image_hash
          : null,
    listing_price:
      typeof record.listing_price === "string"
        ? record.listing_price
        : typeof listing.price === "string"
          ? listing.price
          : listing.price != null
            ? String(listing.price)
            : null,
    other_id: typeof record.other_id === "number" ? record.other_id : null,
    other_user:
      otherUser && typeof otherUser.name === "string"
        ? {
            name: otherUser.name,
            avatar_url: typeof otherUser.avatar_url === "string" ? otherUser.avatar_url : null,
          }
        : null,
  };
}

function normalizeMessage(item: unknown): Message {
  const record = isRecord(item) ? item : {};

  return {
    id: Number(record.id),
    conversation_id: Number(record.conversation_id),
    sender_id: Number(record.sender_id),
    content: typeof record.content === "string" ? record.content : "",
    created_at: typeof record.created_at === "string" ? record.created_at : "",
    read_at: typeof record.read_at === "string" ? record.read_at : null,
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

  const data = await handleJsonResponse<unknown>(response);
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

  const data = await handleJsonResponse<unknown>(response);
  return normalizeConversation(data);
}

export async function fetchMessages(conversationId: number): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages/`, {
    method: "GET",
    headers: getAuthHeaders(),
    credentials: "include",
  });

  const data = await handleJsonResponse<unknown>(response);
  return Array.isArray(data) ? data.map(normalizeMessage) : [];
}
