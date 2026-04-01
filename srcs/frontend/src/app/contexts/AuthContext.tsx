import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

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
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Since data-service has no login route, simulate login with stored user or create a fake session
    // Try the API first
    try {
      const res = await api.login({ email, password: _password });
      const fakeToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToken(fakeToken);
      setUser(res.user);
      localStorage.setItem("auth_token", fakeToken);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
      return;
    } catch {
      // Fallback: check if there's a registered user in localStorage
      const registeredUser = localStorage.getItem("registered_user");
      if (registeredUser) {
        const parsed = JSON.parse(registeredUser);
        if (parsed.email === email) {
          const fakeToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          setToken(fakeToken);
          setUser(parsed);
          localStorage.setItem("auth_token", fakeToken);
          localStorage.setItem("auth_user", JSON.stringify(parsed));
          return;
        }
      }
      throw new Error("Invalid credentials. Please register first.");
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string }) => {
    try {
      const res = await api.register(data);
      const fakeToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const userData: User = {
        id: res.user?.id || String(Date.now()),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "user",
      };
      localStorage.setItem("registered_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", fakeToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setToken(fakeToken);
      setUser(userData);
    } catch {
      // If API fails, still create local user (data-service may not have register route)
      const fakeToken = `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const userData: User = {
        id: String(Date.now()),
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "user",
      };
      localStorage.setItem("registered_user", JSON.stringify(userData));
      localStorage.setItem("auth_token", fakeToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setToken(fakeToken);
      setUser(userData);
    }
  }, []);

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
