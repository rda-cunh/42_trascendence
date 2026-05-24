import type { Conversation, Message } from "@/app/core/types/chat";
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

function formatPrice(value: string | null | undefined) {
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return value;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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

  const listingTitle = conversation.listing_name || `Listing #${conversation.listing_id}`;
  const otherName = conversation.other_user?.name || `User #${conversation.other_id ?? "?"}`;
  const listingPrice = formatPrice(conversation.listing_price);
  const initials = getInitials(otherName || "U");

  return (
    <section className="chat-panel chat-window">
      <header className="chat-window-header">
        <div className="chat-window-heading">
          <div className="chat-window-avatar">{initials}</div>

          <div className="chat-window-heading-copy">
            <h2>{listingTitle}</h2>
            <p className="chat-window-subtitle">{otherName}</p>

            <div className="chat-window-meta">
              {listingPrice && <span>{listingPrice}</span>}
              <span className={`chat-status ${socketConnected ? "is-online" : "is-offline"}`}>
                {socketConnected ? "Connected" : "Connecting..."}
              </span>
            </div>
          </div>
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
