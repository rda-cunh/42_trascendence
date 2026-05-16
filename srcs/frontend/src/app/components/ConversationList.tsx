import type { Conversation } from "../types/chat";

type Props = {
  conversations: Conversation[];
  selectedConversationId: number | null;
  loading: boolean;
  refreshing: boolean;
  updatedConversationIds: number[];
  onSelect: (conversation: Conversation) => void;
  onRefresh: () => void;
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  loading,
  refreshing,
  updatedConversationIds,
  onSelect,
  onRefresh,
}: Props) {
  if (loading) {
    return <div className="chat-panel chat-list-empty">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <div className="chat-panel chat-list-empty">No conversations yet.</div>;
  }

  return (
    <aside className="chat-panel chat-sidebar">
      <div className="chat-sidebar-header chat-sidebar-header-row">
        <h2>Messages</h2>
        <button
          type="button"
          className="chat-refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="chat-conversation-list">
        {conversations.map((conversation) => {
          const isActive = conversation.id === selectedConversationId;
          const hasUpdate = updatedConversationIds.includes(conversation.id);
          const title = conversation.listing_name || `Listing #${conversation.listing_id}`;
          const otherName = conversation.other_user?.name || `User #${conversation.other_id ?? "?"}`;
          const preview = conversation.last_message || "Start the conversation";
          const timestamp = formatDateTime(conversation.last_message_at);
          const initials = getInitials(otherName || "U");

          return (
            <button
              key={conversation.id}
              type="button"
              className={`chat-conversation-item ${isActive ? "is-active" : ""}`}
              onClick={() => onSelect(conversation)}
            >
              <div className="chat-conversation-avatar">{initials}</div>

              <div className="chat-conversation-copy">
                <div className="chat-conversation-topline">
                  <div className="chat-conversation-title-row">
                    <div className="chat-conversation-title">{title}</div>
                    {hasUpdate && <span className="chat-conversation-dot" aria-hidden="true" />}
                  </div>
                  <div className="chat-conversation-time">{timestamp}</div>
                </div>

                <div className="chat-conversation-subtitle">{otherName}</div>

                <div className="chat-conversation-preview">{preview}</div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}