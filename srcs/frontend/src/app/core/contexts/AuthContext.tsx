import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/app/core/types";
import { api, getAccessToken, normalizeUser, parseUserFromToken } from "@/app/core/lib/api";

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
    localStorage.removeItem("auth_provider");
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

    if (nextUser?.auth_provider) {
      localStorage.setItem("auth_provider", nextUser.auth_provider);
    } else {
      localStorage.removeItem("auth_provider");
    }

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
      const savedAuthProvider = localStorage.getItem("auth_provider");

      if (isUsableToken(savedToken)) {
        setToken(savedToken);
        api.setToken(savedToken);

        const fallbackUser = parseUserFromToken(savedToken);
        const hydratedFallbackUser = fallbackUser
          ? {
              ...fallbackUser,
              auth_provider:
                savedAuthProvider === "oauth42" || savedAuthProvider === "local"
                  ? savedAuthProvider
                  : undefined,
            }
          : null;

        if (hydratedFallbackUser) setUser(hydratedFallbackUser);

        try {
          const profile = await api.getProfile();
          const nextUser = mapProfileToAuthUser(profile ?? {}, fallbackUser);

          if (nextUser) {
            setUser(nextUser);
          } else if (!fallbackUser) {
            clearAuthState();
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
            .refreshToken()
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
    const normalizedUser = normalizeUser(res, newToken);
    const fallbackUser = normalizedUser ? { ...normalizedUser, auth_provider: "local" as const } : null;
    const profile = await api.getProfile().catch(() => null);
    const nextUser = profile ? mapProfileToAuthUser(profile, fallbackUser) : fallbackUser;
    persistAuth(newToken, nextUser);
  };

  const syncProfileAvatar = async () => {
    const currentProfile = await api.getProfile().catch(() => null);

    if (!currentProfile) {
      return currentProfile;
    }

    const currentAvatar = currentProfile.avatar_url?.trim();

    const uploadAvatarFromSource = async (sourceUrl: string, filename: string) => {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error("Failed to load avatar image");
      }

      const blob = await response.blob();
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });

      const upload = await api.uploadImage(file);
      const avatarUrl = upload.url ?? `/images/${upload.filename}`;

      await api.updateProfile({ avatar_url: avatarUrl });

      return api.getProfile().catch(() => ({
        ...currentProfile,
        avatar_url: avatarUrl,
      }));
    };

    if (!currentAvatar) {
      return uploadAvatarFromSource("/default-avatar.jpg", "default-avatar.jpg");
    }

    const isLocalAvatar =
      currentAvatar.startsWith("/images/") ||
      currentAvatar.startsWith("/default-avatar.jpg") ||
      currentAvatar.startsWith(window.location.origin);

    if (isLocalAvatar) {
      return currentProfile;
    }

    return uploadAvatarFromSource(currentAvatar, "oauth-avatar.jpg");
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

    const normalizedUser = normalizeUser(res, newToken);
    const fallbackUser = normalizedUser ? { ...normalizedUser, auth_provider: "local" as const } : null;
    const profile = await syncProfileAvatar();
    const nextUser = profile ? mapProfileToAuthUser(profile, fallbackUser) : fallbackUser;

    persistAuth(newToken, nextUser);
  };

  const mapProfileToAuthUser = (
    profile: {
      id?: string | number;
      email?: string;
      name?: string;
      phone?: string | null;
      avatar_url?: string | null;
      role?: string;
      status?: string | null;
    },
    fallbackUser?: User | null
  ): User | null => {
    const resolvedId = profile.id ?? fallbackUser?.id;

    if (!resolvedId) {
      return null;
    }

    return {
      id: String(resolvedId),
      email: profile.email ?? fallbackUser?.email ?? "",
      name: profile.name ?? fallbackUser?.name,
      phone: profile.phone ?? fallbackUser?.phone ?? undefined,
      avatar_url: profile.avatar_url ?? fallbackUser?.avatar_url ?? undefined,
      auth_provider: fallbackUser?.auth_provider,
      role: (profile.role ?? fallbackUser?.role) as User["role"] | undefined,
      status: (profile.status?.toLowerCase() ?? fallbackUser?.status) as User["status"] | undefined,
    };
  };

  const loginWithOAuth = async (accessToken: string, oauthUser?: User) => {
    setToken(accessToken);
    localStorage.setItem("auth_token", accessToken);
    api.setToken(accessToken);

    const baseFallbackUser = oauthUser ?? parseUserFromToken(accessToken);
    const fallbackUser = baseFallbackUser
      ? { ...baseFallbackUser, auth_provider: "oauth42" as const }
      : null;

    if (fallbackUser) {
      setUser(fallbackUser);
    }

    try {
      const profile = await syncProfileAvatar();
      const nextUser = mapProfileToAuthUser(profile ?? {}, fallbackUser);

      if (nextUser) {
        persistAuth(accessToken, nextUser);
      }
    } catch {
      // Keep token-derived or backend-provided user if profile/avatar sync fails.
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // Server logout failed; still clear local session below.
    } finally {
      clearAuthState();
    }
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
