import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api } from "../lib/api";

interface PresenceContextType {
  onlineUsers: Record<string, boolean>;
  subscribe: (userId: string | number) => void;
  unsubscribe: (userId: string | number) => void;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export function PresenceProvider({ children }: { children: ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  const subscribe = useCallback((userId: string | number) => {
    setTrackedIds((prev) => {
      const next = new Set(prev);
      next.add(String(userId));
      return next;
    });
  }, []);

  const unsubscribe = useCallback((userId: string | number) => {
    setTrackedIds((prev) => {
      const next = new Set(prev);
      next.delete(String(userId));
      return next;
    });
  }, []);

  useEffect(() => {
    if (trackedIds.size === 0) return;

    const fetchPresence = async () => {
      try {
        const idsArray = Array.from(trackedIds)
          .map(Number)
          .filter((id) => !isNaN(id));
        if (idsArray.length === 0) return;

        const data = await api.getPresence(idsArray);
        setOnlineUsers((prev) => {
          let changed = false;
          const next = { ...prev };

          // Set all tracked to offline first
          for (const id of idsArray) {
            if (next[String(id)] !== false) {
              next[String(id)] = false;
              changed = true;
            }
          }

          // Then update the online ones
          for (const [id, isOnline] of Object.entries(data)) {
            if (next[id] !== isOnline) {
              next[id] = isOnline;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch (err) {
        console.error("Failed to fetch presence", err);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000);
    return () => clearInterval(interval);
  }, [trackedIds]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, subscribe, unsubscribe }}>
      {children}
    </PresenceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePresence(userId?: string | number | null) {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within PresenceProvider");
  }

  const { subscribe, unsubscribe, onlineUsers } = context;

  useEffect(() => {
    if (userId != null) {
      subscribe(userId);
      return () => unsubscribe(userId);
    }
  }, [userId, subscribe, unsubscribe]);

  return userId != null ? !!onlineUsers[String(userId)] : false;
}
