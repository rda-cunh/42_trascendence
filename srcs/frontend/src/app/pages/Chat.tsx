import { useAuth } from "../contexts/AuthContext";
import { useChat } from "../hooks/useChat";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import "../../styles/chat.css";

export function Chat() {
  const { user, token } = useAuth();
  const currentUserId = Number(user?.id);
  const {
    conversations,
    selectedConversation,
    messages,
    loadingConversations,
    loadingMessages,
    socketConnected,
    error,
    selectConversation,
    sendMessage,
  } = useChat(token);

  return (
    <main className="chat-page">
      <div className="chat-page-header">
        <h1>Messages</h1>
        <p>Chat with buyers and sellers about listings.</p>
      </div>

      {error && <div className="chat-error-banner">{error}</div>}

      <div className="chat-shell">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?.id ?? null}
          loading={loadingConversations}
          onSelect={selectConversation}
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
