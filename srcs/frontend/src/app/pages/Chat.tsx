import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import "../../styles/chat.css";

function formatSyncTime(value: string | null) {
  if (!value) return "Not synced yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not synced yet";
  return `Last updated ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function Chat() {
  const { user, token } = useAuth();
  const currentUserId = Number(user?.id);
  const {
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
  } = useChat(token);

  return (
    <main className="chat-page">
      <div className="chat-page-header">
        <h1>Messages</h1>
        <p>Your conversations about marketplace listings.</p>
        <div className="chat-page-meta">
          {formatSyncTime(lastRefreshedAt)}
          {refreshingConversations ? " · Refreshing inbox" : ""}
        </div>
      </div>

      {error && <div className="chat-error-banner">{error}</div>}

      <div className="chat-shell">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id ?? null}
          loading={loadingConversations}
          refreshing={refreshingConversations}
          updatedConversationIds={updatedConversationIds}
          onSelect={selectConversation}
          onRefresh={() => void refreshConversations()}
        />
        <div className="chat-main-column">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            currentUserId={Number.isFinite(currentUserId) ? currentUserId : -1}
            loading={loadingMessages}
            socketConnected={socketConnected}
            onSend={sendMessage}
          />
        </div>
      </div>
    </main>
  );
}
