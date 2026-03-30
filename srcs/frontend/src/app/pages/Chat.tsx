import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const botResponses = [
  "Thanks for your message! Our support team typically responds within 24 hours.",
  "I'd be happy to help with that. Could you provide more details?",
  "That's a great question! Let me look into it for you.",
  "You can find more information in our FAQ section.",
  "Is there anything else I can help you with today?",
];

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hey ${user?.name || "there"}! 👋 Welcome to GameAsset Hub support. How can we help you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: String(Date.now() + 1),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Support Chat</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Get help from our team</p>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col" style={{ height: "60vh" }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === "bot" ? "bg-purple-100 dark:bg-purple-900/30" : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {msg.sender === "bot" ? (
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className={`max-w-[75%] ${msg.sender === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
              <button type="submit" disabled={!input.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
