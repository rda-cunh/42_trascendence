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
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const parseUserFromToken = (jwt: string): User | null => {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const tokenId = payload.external_user_id ?? payload.user_id ?? payload.sub;
      if (!tokenId) return null;
      return {
        id: String(tokenId),
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      if (savedToken) {
        setToken(savedToken);
        api.setToken(savedToken);

        const fallbackUser = parseUserFromToken(savedToken);
        if (fallbackUser) setUser(fallbackUser);

        try {
          const profile = await api.getProfile();
          if (profile?.id) {
            setUser({
              id: String(profile.id),
              email: profile.email,
              name: profile.name,
              phone: profile.phone,
              role: profile.role,
              status: profile.status?.toLowerCase(),
            });
          }
        } catch {
          // TODO: Keep fallback user from token if profile request fails.
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    const logoutInner = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("auth_token");
      api.setToken(null);
    };

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
            .catch(() => logoutInner());
        }
      } catch {
        logoutInner();
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

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // TODO: Clear local auth state even if server logout fails.
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    api.setToken(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const payload = {
      name: data.name,
      phone: data.phone,
    };

    const updated = await api.updateProfile(payload);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...data,
            id: String(updated?.id ?? prev.id),
            email: updated?.email ?? prev.email,
            name: updated?.name ?? data.name ?? prev.name,
            phone: updated?.phone ?? data.phone ?? prev.phone,
            role: updated?.role ?? prev.role,
            status: updated?.status?.toLowerCase() ?? prev.status,
          }
        : null
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
