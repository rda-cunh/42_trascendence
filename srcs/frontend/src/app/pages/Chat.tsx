import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router';

interface Message {
  id: number;
  sender: string;
  sender_id: number;
  content: string;
  timestamp: string;
}

export function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load message history
    fetch(`/api/conversations/${conversationId}/messages/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming JWT token
      },
    })
      .then(res => res.json())
      .then(data => setMessages(data.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender_name,
        sender_id: msg.sender,
        content: msg.content,
        timestamp: msg.created_at,
      }))));

    // Connect to WebSocket
    const websocket = new WebSocket(`ws://localhost:8000/ws/chat/${conversationId}/`);
    websocket.onopen = () => {
      console.log('WebSocket connected');
    };
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, {
        id: Date.now(), // temp id
        sender: data.sender,
        sender_id: data.sender_id,
        content: data.message,
        timestamp: data.timestamp,
      }]);
    };
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (ws && newMessage.trim()) {
      ws.send(JSON.stringify({ message: newMessage }));
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {msg.sender[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {msg.sender}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-1">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}