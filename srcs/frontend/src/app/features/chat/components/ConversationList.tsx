import { usePresence } from "@/app/core/contexts/PresenceContext";
import type { Conversation } from "@/app/core/types/chat";
import { parseServerDate } from "@/app/shared/utils/time";

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
  const date = parseServerDate(value);
  if (!date) return "";
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

function ConversationItem({
  conversation,
  isActive,
  hasUpdate,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  hasUpdate: boolean;
  onSelect: (conversation: Conversation) => void;
}) {
  const isOnline = usePresence(conversation.other_id);
  const title = conversation.listing_name || `Listing #${conversation.listing_id}`;
  const otherName = conversation.other_user?.name || `User #${conversation.other_id ?? "?"}`;
  const preview = conversation.last_message || "Start the conversation";
  const timestamp = formatDateTime(conversation.last_message_at);
  const initials = getInitials(otherName || "U");

  return (
    <button
      type="button"
      className={`chat-conversation-item ${isActive ? "is-active" : ""}`}
      onClick={() => onSelect(conversation)}
    >
      <div className="relative inline-block">
        <div className="chat-conversation-avatar">{initials}</div>
        {conversation.other_id != null && (
          <span
            className={`absolute right-0 bottom-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        )}
      </div>

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

          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={isActive}
              hasUpdate={hasUpdate}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </aside>
  );
}
