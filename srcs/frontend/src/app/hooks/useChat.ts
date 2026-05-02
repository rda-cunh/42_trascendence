import { useCallback, useEffect, useRef, useState } from "react";
import type { Conversation, Message } from "../types/chat";
import { fetchConversations, fetchMessages } from "../lib/chatApi";
import { ChatSocket } from "../lib/chatSocket";

type UseChatResult = {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  socketConnected: boolean;
  error: string | null;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (text: string) => void;
  refreshConversations: () => Promise<void>;
};

export function useChat(accessToken: string | null): UseChatResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);
  const selectedConversationId = selectedConversation?.id ?? null;

  const refreshConversations = useCallback(async () => {
    if (!accessToken) {
      setConversations([]);
      setSelectedConversation(null);
      setLoadingConversations(false);
      setError("You need to be logged in to use chat");
      return;
    }

    try {
      setLoadingConversations(true);
      setError(null);
      const data = await fetchConversations(accessToken);
      setConversations(data);

      if (!selectedConversationId && data.length > 0) {
        setSelectedConversation(data[0]);
      } else if (selectedConversationId) {
        const updatedSelected = data.find((c) => c.id === selectedConversationId) || null;
        setSelectedConversation(updatedSelected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoadingConversations(false);
    }
  }, [accessToken, selectedConversationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    if (!selectedConversationId || !accessToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        const history = await fetchMessages(selectedConversationId, accessToken);
        if (!cancelled) {
          setMessages(history);
        }

        socketRef.current?.disconnect();

        const socket = new ChatSocket(selectedConversationId, accessToken, {
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

            if (payload.type === "message") {
              if (!cancelled) {
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === payload.message.id);
                  return exists ? prev : [...prev, payload.message];
                });

                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === payload.message.conversation_id
                      ? {
                          ...conv,
                          last_message: payload.message.content,
                          last_message_at: payload.message.created_at,
                        }
                      : conv
                  )
                );
              }
            }
          },
        });

        socket.connect();
        socketRef.current = socket;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load messages");
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    void loadConversation();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [selectedConversationId, accessToken]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

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

  return {
    conversations,
    selectedConversation,
    messages,
    loadingConversations,
    loadingMessages,
    socketConnected,
    error,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}
