import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";
import { api, getAccessToken, normalizeUser, parseUserFromToken } from "../lib/api";

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
  completeOAuthLogin: (accessToken: string, userData?: unknown) => Promise<void>;
  startOAuth42: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    api.setToken(null);
  };

  const persistAuth = (newToken: string, nextUser: User | null) => {
    setToken(newToken);
    setUser(nextUser);
    localStorage.setItem("auth_token", newToken);
    api.setToken(newToken);
  };

  useEffect(() => {
    api.setTokenChangeHandler((newToken) => {
      if (newToken) {
        setToken(newToken);
        localStorage.setItem("auth_token", newToken);
      } else {
        clearAuthState();
      }
    });

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
          if (!fallbackUser) clearAuthState();
        }
      }
      setLoading(false);
    };
    initAuth();

    return () => api.setTokenChangeHandler(null);
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
              const newToken = getAccessToken(res);
              if (!newToken) throw new Error("Missing refreshed token");
              setToken(newToken);
              setUser((prev) => normalizeUser(res, newToken) ?? prev);
              localStorage.setItem("auth_token", newToken);
              api.setToken(newToken);
            })
            .catch(() => clearAuthState());
        }
      } catch {
        clearAuthState();
      }
    };

    const interval = setInterval(checkTokenExpiry, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    const newToken = getAccessToken(res);
    if (!newToken) throw new Error("Login response did not include an access token");

    api.setToken(newToken);
    const profile = await api.getProfile().catch(() => null);
    persistAuth(newToken, normalizeUser(profile ?? res, newToken));
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    await api.register({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    });
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // TODO: Clear local auth state even if server logout fails.
    }
    clearAuthState();
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

  const completeOAuthLogin = async (accessToken: string, userData?: unknown) => {
    api.setToken(accessToken);
    const profile = await api.getProfile().catch(() => null);
    persistAuth(accessToken, normalizeUser(profile ?? userData, accessToken));
  };

  const startOAuth42 = () => {
    window.location.assign(api.getOAuth42Url());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        completeOAuthLogin,
        startOAuth42,
      }}
    >
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
