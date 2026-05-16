import { useMemo, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProductChat } from "../hooks/useProductChat";
import type { Message } from "../types/chat";

type ProductChatWidgetProps = {
  listingId: number | null;
  sellerId: number | null;
  sellerName?: string;
  productTitle?: string;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ProductChatMessages({
  messages,
  currentUserId,
}: {
  messages: Message[];
  currentUserId: number;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Start the conversation about this product.
      </div>
    );
  }

  return (
    <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const mine = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${mine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                mine
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              <div className="break-words">{message.content}</div>
              <div
                className={`mt-1 text-[11px] ${
                  mine ? "text-purple-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTime(message.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ProductChatWidget({
  listingId,
  sellerId,
  sellerName,
  productTitle,
}: ProductChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const currentUserId = Number(user?.id);
  const normalizedListingId = Number.isInteger(listingId) && listingId && listingId > 0 ? listingId : null;
  const normalizedSellerId = Number.isInteger(sellerId) && sellerId && sellerId > 0 ? sellerId : null;

  const canRender = useMemo(() => {
    if (!user) return false;
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) return false;
    if (!normalizedListingId || !normalizedSellerId) return false;
    if (currentUserId === normalizedSellerId) return false;
    return true;
  }, [user, currentUserId, normalizedListingId, normalizedSellerId]);

  const { messages, loading, socketConnected, error, sendMessage, retry } = useProductChat({
    listingId: normalizedListingId,
    isOpen,
    enabled: canRender,
  });

  if (!canRender) {
    return null;
  }

  const handleSend = () => {
    const clean = draft.trim();
    if (!clean) return;
    sendMessage(clean);
    setDraft("");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 left-4 z-50 flex h-[540px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {sellerName || "Seller"}
              </div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                {productTitle || "About this product"}
              </div>
              <div
                className={`mt-1 text-[11px] ${
                  socketConnected ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {socketConnected ? "Connected" : "Connecting"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <div>{error}</div>
              <button
                type="button"
                onClick={() => void retry()}
                className="mt-1 font-medium underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 bg-gray-50 dark:bg-gray-950">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Loading conversation...
              </div>
            ) : (
              <ProductChatMessages messages={messages} currentUserId={currentUserId} />
            )}
          </div>

          <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-700">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message..."
                rows={2}
                className="min-h-[44px] flex-1 resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || !socketConnected}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 left-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-colors hover:bg-purple-700"
        aria-label={isOpen ? "Close product chat" : "Open product chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}