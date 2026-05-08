import type { Conversation } from "../types/chat";

type Props = {
  conversations: Conversation[];
  selectedConversationId: number | null;
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
};

export default function ConversationList({
  conversations,
  selectedConversationId,
  loading,
  onSelect,
}: Props) {
  if (loading) {
    return <div className="chat-panel chat-list-empty">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return <div className="chat-panel chat-list-empty">No conversations yet.</div>;
  }

  return (
    <aside className="chat-panel chat-sidebar">
      <div className="chat-sidebar-header">
        <h2>Messages</h2>
      </div>

      <div className="chat-conversation-list">
        {conversations.map((conversation) => {
          const isActive = conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              type="button"
              className={`chat-conversation-item ${isActive ? "is-active" : ""}`}
              onClick={() => onSelect(conversation)}
            >
              <div className="chat-conversation-title">Listing #{conversation.listing_id}</div>
              <div className="chat-conversation-preview">
                {conversation.last_message || "Start the conversation"}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
