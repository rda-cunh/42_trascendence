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
  refreshingConversations: boolean;
  socketConnected: boolean;
  error: string | null;
  updatedConversationIds: number[];
  lastRefreshedAt: string | null;
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
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedConversationIds, setUpdatedConversationIds] = useState<number[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const socketRef = useRef<ChatSocket | null>(null);
  const tokenRef = useRef(accessToken);
  const conversationsRef = useRef<Conversation[]>([]);
  const selectedConversationIdRef = useRef<number | null>(null);

  const selectedConversationId = selectedConversation?.id ?? null;

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const hasToken = accessToken !== null;

  const refreshConversations = useCallback(async () => {
    if (!tokenRef.current) {
      setConversations([]);
      setSelectedConversation(null);
      setUpdatedConversationIds([]);
      setLoadingConversations(false);
      setRefreshingConversations(false);
      setError("You need to be logged in to use chat");
      return;
    }

    const isInitialLoad = conversationsRef.current.length === 0;

    try {
      if (isInitialLoad) {
        setLoadingConversations(true);
      } else {
        setRefreshingConversations(true);
      }

      setError(null);
      const data = await fetchConversations();
      const previous = conversationsRef.current;
      const previousById = new Map(previous.map((conversation) => [conversation.id, conversation]));

      setUpdatedConversationIds((prevUpdated) => {
        const nextUpdated = new Set(prevUpdated);

        for (const conversation of data) {
          const previousConversation = previousById.get(conversation.id);
          const changed =
            previousConversation &&
            previousConversation.last_message_at !== conversation.last_message_at;

          if (changed && conversation.id !== selectedConversationIdRef.current) {
            nextUpdated.add(conversation.id);
          }
        }

        return Array.from(nextUpdated);
      });

      setConversations(data);
      setLastRefreshedAt(new Date().toISOString());

      if (!selectedConversationIdRef.current && data.length > 0) {
        setSelectedConversation(data[0]);
      } else if (selectedConversationIdRef.current) {
        const updatedSelected =
          data.find((conversation) => conversation.id === selectedConversationIdRef.current) ||
          null;
        setSelectedConversation(updatedSelected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoadingConversations(false);
      setRefreshingConversations(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshConversations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshConversations]);

  useEffect(() => {
    if (!hasToken) return;

    const interval = window.setInterval(() => {
      void refreshConversations();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasToken, refreshConversations]);

  useEffect(() => {
    if (!selectedConversationId || !hasToken) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      try {
        setLoadingMessages(true);
        setError(null);

        const history = await fetchMessages(selectedConversationId);
        if (!cancelled) {
          setMessages(history);
        }

        socketRef.current?.disconnect();

        const socket = new ChatSocket(selectedConversationId, {
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
                  const exists = prev.some((message) => message.id === payload.message.id);
                  return exists ? prev : [...prev, payload.message];
                });

                setUpdatedConversationIds((prevUpdated) =>
                  prevUpdated.filter((id) => id !== payload.message.conversation_id)
                );

                setConversations((prev) => {
                  const updated = prev.map((conversation) =>
                    conversation.id === payload.message.conversation_id
                      ? {
                          ...conversation,
                          last_message: payload.message.content,
                          last_message_at: payload.message.created_at,
                        }
                      : conversation
                  );

                  return [...updated].sort((a, b) => {
                    const aTime = a.last_message_at ?? a.created_at ?? "";
                    const bTime = b.last_message_at ?? b.created_at ?? "";
                    return bTime.localeCompare(aTime);
                  });
                });
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
  }, [selectedConversationId, hasToken]);

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setUpdatedConversationIds((prevUpdated) => prevUpdated.filter((id) => id !== conversation.id));
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
    refreshingConversations,
    socketConnected,
    error,
    updatedConversationIds,
    lastRefreshedAt,
    selectConversation,
    sendMessage,
    refreshConversations,
  };
}
