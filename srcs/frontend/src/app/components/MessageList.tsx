import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";

type Props = {
  messages: Message[];
  currentUserId: number;
};

export default function MessageList({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return <div className="chat-messages-empty">No messages yet. Say hello.</div>;
  }

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const mine = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`chat-message-row ${mine ? "is-mine" : "is-theirs"}`}
          >
            <div className="chat-message-bubble">
              <div className="chat-message-content">{message.content}</div>
              <div className="chat-message-time">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
