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
  loginWithOAuth: (accessToken: string, oauthUser?: User) => Promise<void>;
}

const missingAuthProviderError = "useAuth must be used within AuthProvider";

const fallbackAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: false,
  login: async () => {
    throw new Error(missingAuthProviderError);
  },
  register: async () => {
    throw new Error(missingAuthProviderError);
  },
  logout: async () => {
    throw new Error(missingAuthProviderError);
  },
  updateUser: async () => {
    throw new Error(missingAuthProviderError);
  },
  loginWithOAuth: async () => {
    throw new Error(missingAuthProviderError);
  },
};

const AuthContext = createContext<AuthContextType>(fallbackAuthContext);

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

  const isUsableToken = (value: unknown): value is string => {
    return (
      typeof value === "string" &&
      value.trim().length > 0 &&
      value !== "undefined" &&
      value !== "null"
    );
  };

  const persistAuth = (newToken: string, nextUser: User | null) => {
    setToken(newToken);
    setUser(nextUser);
    localStorage.setItem("auth_token", newToken);
    api.setToken(newToken);
  };

  useEffect(() => {
    api.setTokenChangeHandler((newToken) => {
      if (isUsableToken(newToken)) {
        setToken(newToken);
        localStorage.setItem("auth_token", newToken);
      } else {
        clearAuthState();
      }
    });

    const initAuth = async () => {
      const savedToken = localStorage.getItem("auth_token");
      if (isUsableToken(savedToken)) {
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
              avatar_url: profile.avatar_url,
              role: profile.role,
              status: profile.status?.toLowerCase(),
            });
          }
        } catch {
          if (!fallbackUser) clearAuthState();
        }
      } else {
        localStorage.removeItem("auth_token");
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
              if (!isUsableToken(newToken)) throw new Error("Missing refreshed token");
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

  useEffect(() => {
    if (!token || !user) return;

    const ping = () => {
      api.pingPresence().catch(() => {
        // Ignore presence ping errors silently
      });
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

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
    const res = await api.register(data);
    let newToken = getAccessToken(res);

    // Some backends create the user on registration but do not issue an access
    // token. In that case, attempt to login immediately using the provided
    // credentials so the user is signed in after registering.
    if (!isUsableToken(newToken)) {
      try {
        const loginResp = await api.login(data.email, data.password);
        newToken = getAccessToken(loginResp);
      } catch {
        clearAuthState();
        throw new Error("Register response did not include a valid access token");
      }
    }

    if (!isUsableToken(newToken)) {
      clearAuthState();
      throw new Error("Register response did not include a valid access token");
    }

    api.setToken(newToken);
    const profile = await api.getProfile().catch(() => null);
    persistAuth(newToken, normalizeUser(profile ?? res, newToken));
  };

  const loginWithOAuth = async (accessToken: string, oauthUser?: User) => {
    setToken(accessToken);
    localStorage.setItem("auth_token", accessToken);
    api.setToken(accessToken);

    if (oauthUser) {
      setUser(oauthUser);
    } else {
      const fallback = parseUserFromToken(accessToken);
      if (fallback) setUser(fallback);
    }

    try {
      const profile = await api.getProfile();
      if (profile?.id) {
        setUser({
          id: String(profile.id),
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          role: profile.role,
          status: profile.status?.toLowerCase(),
        });
      }
    } catch {
      // Keep token-derived or backend-provided user if profile fetch fails.
    }
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
      avatar_url: data.avatar_url,
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
            avatar_url: updated?.avatar_url ?? data.avatar_url ?? prev.avatar_url,
            role: updated?.role ?? prev.role,
            status: updated?.status?.toLowerCase() ?? prev.status,
          }
        : null
    );
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser, loginWithOAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
