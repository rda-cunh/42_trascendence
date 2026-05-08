import type { ChatSocketIncoming } from "../types/chat";

type SocketHandlers = {
  onMessage: (payload: ChatSocketIncoming) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
};

export class ChatSocket {
  private socket: WebSocket | null = null;
  private readonly conversationId: number;
  private readonly token: string;
  private readonly handlers: SocketHandlers;

  constructor(conversationId: number, token: string, handlers: SocketHandlers) {
    this.conversationId = conversationId;
    this.token = token;
    this.handlers = handlers;
  }

  connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/ws/chat/${this.conversationId}/?token=${encodeURIComponent(
      this.token
    )}`;

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.handlers.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as ChatSocketIncoming;
        this.handlers.onMessage(payload);
      } catch {
        this.handlers.onMessage({
          type: "error",
          detail: "Invalid socket payload",
        });
      }
    };

    this.socket.onclose = () => {
      this.handlers.onClose?.();
    };

    this.socket.onerror = () => {
      this.handlers.onError?.();
    };
  }

  sendMessage(message: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Socket is not connected");
    }

    this.socket.send(JSON.stringify({ message }));
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }

  isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}