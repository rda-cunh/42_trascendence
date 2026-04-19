import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../lib/api";

// Centralized auth service to simplify login/register logic
/* eslint-disable react-refresh/only-export-components */

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("auth_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("auth_token");
  });
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string) => {
    try {
      // Try API login first
      const res = await api.login({ email, password: _password });
      const token = res.token || generateMockToken();

      setToken(token);
      setUser(res.user);
      persistAuth(token, res.user);
    } catch {
      // Fallback to mock login for development
      const mockUser = getMockUserByEmail(email);
      if (mockUser) {
        const token = generateMockToken();
        setToken(token);
        setUser(mockUser);
        persistAuth(token, mockUser);
      } else {
        throw new Error("Invalid credentials. Please register first.");
      }
    }
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string; phone?: string }) => {
      try {
        // Try API registration
        const res = await api.register(data);
        const token = res.token || generateMockToken();
        const userData: User = {
          id: res.user?.id || String(Date.now()),
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: "user",
        };

        setToken(token);
        setUser(userData);
        persistAuth(token, userData);
        saveMockUser(userData);
      } catch {
        // Fallback to mock registration for development
        const token = generateMockToken();
        const userData: User = {
          id: String(Date.now()),
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: "user",
        };

        setToken(token);
        setUser(userData);
        persistAuth(token, userData);
        saveMockUser(userData);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Helper functions for cleaner code
function generateMockToken(): string {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function persistAuth(token: string, user: User): void {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
}

function saveMockUser(user: User): void {
  localStorage.setItem("registered_user", JSON.stringify(user));
}

function getMockUserByEmail(email: string): User | null {
  const registeredUser = localStorage.getItem("registered_user");
  if (registeredUser) {
    const parsed = JSON.parse(registeredUser);
    if (parsed.email === email) {
      return parsed;
    }
  }
  return null;
}
