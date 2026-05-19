export interface ChatUserInfo {
  name: string;
  avatar_url?: string | null;
}

export interface Conversation {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  last_message: string | null;
  last_message_at: string | null;
  created_at?: string;
  listing_name: string | null;
  listing_image_hash: string | null;
  listing_price: string | null;
  other_id: number | null;
  other_user: ChatUserInfo | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  read_at?: string | null;
}

export interface CreateConversationPayload {
  listing_id: number;
}

export type ChatSocketMessage = {
  type: "message";
  message: Message;
};

export type ChatSocketError = {
  type: "error";
  detail: string;
  upstream_status?: number;
  upstream_response?: unknown;
};

export type ChatSocketIncoming = ChatSocketMessage | ChatSocketError;
