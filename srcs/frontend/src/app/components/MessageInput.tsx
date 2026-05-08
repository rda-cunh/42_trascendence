import { useState } from "react";

type Props = {
  disabled?: boolean;
  onSend: (value: string) => void;
};

export default function MessageInput({ disabled = false, onSend }: Props) {
  const [value, setValue] = useState("");

  const submit = () => {
    const clean = value.trim();
    if (!clean) return;
    onSend(clean);
    setValue("");
  };

  return (
    <div className="chat-input-bar">
      <textarea
        className="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a message..."
        rows={2}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        type="button"
        className="chat-send-button"
        onClick={submit}
        disabled={disabled || !value.trim()}
      >
        Send
      </button>
    </div>
  );
}