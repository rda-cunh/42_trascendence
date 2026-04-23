import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000;
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;
        const fiveMinutes = 5 * 60 * 1000;

        if (timeUntilExpiry < fiveMinutes) {
          api
            .refresh()
            .then((res) => {
              const newToken = res.access;
              setToken(newToken);
              localStorage.setItem("auth_token", newToken);
              api.setToken(newToken);
            })
            .catch(() => logout());
        }
      } catch {
        logout();
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    const newToken = res.access;
    setToken(newToken);
    setUser(res.user);
    localStorage.setItem("auth_token", newToken);
    api.setToken(newToken);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await api.register(data);
    const newToken = res.access;
    setToken(newToken);
    setUser(res.user);
    localStorage.setItem("auth_token", newToken);
    api.setToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    api.setToken(null);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
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
