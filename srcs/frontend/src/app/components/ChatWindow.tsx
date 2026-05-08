import type { Conversation, Message } from "../types/chat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

type Props = {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: number;
  loading: boolean;
  socketConnected: boolean;
  onSend: (text: string) => void;
};

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  loading,
  socketConnected,
  onSend,
}: Props) {
  if (!conversation) {
    return (
      <section className="chat-panel chat-window chat-window-empty">
        Select a conversation to start chatting.
      </section>
    );
  }

  return (
    <section className="chat-panel chat-window">
      <header className="chat-window-header">
        <div>
          <h2>Listing #{conversation.listing_id}</h2>
          <p className={`chat-status ${socketConnected ? "is-online" : "is-offline"}`}>
            {socketConnected ? "Connected" : "Connecting..."}
          </p>
        </div>
      </header>

      <div className="chat-window-body">
        {loading ? (
          <div className="chat-messages-empty">Loading messages...</div>
        ) : (
          <MessageList messages={messages} currentUserId={currentUserId} />
        )}
      </div>

      <footer className="chat-window-footer">
        <MessageInput disabled={!socketConnected} onSend={onSend} />
      </footer>
    </section>
  );
}
