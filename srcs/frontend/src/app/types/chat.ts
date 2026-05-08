export type Conversation = {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type ChatSocketIncoming =
  | {
      type: "message";
      message: Message;
    }
  | {
      type: "error";
      detail: string;
      upstream_status?: number;
      upstream_response?: unknown;
    };

export type CurrentUser = {
  id: number;
  name?: string;
  email?: string;
};

export type CreateConversationPayload = {
  listing_id: number;
};