import { useCallback, useEffect, useRef, useState } from "react";
import type { Conversation, Message } from "../types/chat";
import { createOrGetConversation, fetchMessages } from "../lib/chatApi";
import { ChatSocket } from "../lib/chatSocket";

type UseProductChatArgs = {
  listingId: number | null;
  isOpen: boolean;
  enabled: boolean;
};

type UseProductChatResult = {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  socketConnected: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  retry: () => Promise<void>;
};

export function useProductChat({
  listingId,
  isOpen,
  enabled,
}: UseProductChatArgs): UseProductChatResult {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);

  const disconnectSocket = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocketConnected(false);
  }, []);

  const bootstrapConversation = useCallback(async () => {
    if (!enabled || !isOpen || !listingId) {
      disconnectSocket();
      setConversation(null);
      setMessages([]);
      setError(null);
      return;
    }

    let cancelled = false;

    try {
      setLoading(true);
      setError(null);

      const nextConversation = await createOrGetConversation({ listing_id: listingId });
      if (cancelled) return;

      setConversation(nextConversation);

      const history = await fetchMessages(nextConversation.id);
      if (cancelled) return;

      setMessages(Array.isArray(history) ? history : []);

      disconnectSocket();

      const socket = new ChatSocket(nextConversation.id, {
        onOpen: () => {
          if (!cancelled) setSocketConnected(true);
        },
        onClose: () => {
          if (!cancelled) setSocketConnected(false);
        },
        onError: () => {
          if (!cancelled) {
            setSocketConnected(false);
            setError("WebSocket connection error");
          }
        },
        onMessage: (payload) => {
          if (payload.type === "error") {
            if (!cancelled) setError(payload.detail);
            return;
          }

          if (payload.type === "message" && !cancelled) {
            setMessages((prev) => {
              const exists = prev.some((message) => message.id === payload.message.id);
              return exists ? prev : [...prev, payload.message];
            });
          }
        },
      });

      socket.connect();
      socketRef.current = socket;
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Failed to start chat");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [disconnectSocket, enabled, isOpen, listingId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void bootstrapConversation();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      disconnectSocket();
    };
  }, [bootstrapConversation, disconnectSocket]);

  const sendMessage = (text: string) => {
    const clean = text.trim();
    if (!clean) return;

    if (!socketRef.current || !socketRef.current.isOpen()) {
      setError("Chat connection is not ready");
      return;
    }

    try {
      socketRef.current.sendMessage(clean);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  const retry = async () => {
    await bootstrapConversation();
  };

  return {
    conversation,
    messages,
    loading,
    socketConnected,
    error,
    sendMessage,
    retry,
  };
}
