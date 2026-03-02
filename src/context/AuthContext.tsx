import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthSession, AuthUser } from "@/lib/auth";
import {
  clearPersistedSession,
  getAccessToken,
  getPersistedUser,
  login as loginRequest,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
  register as registerRequest,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  register: (email: string, password: string) => Promise<AuthSession | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<AuthSession>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingUser = getPersistedUser();
    const existingToken = getAccessToken();
    setUser(existingUser);
    setAccessToken(existingToken);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      loading,
      login: async (email, password) => {
        const session = await loginRequest(email, password);
        setUser(session.user);
        setAccessToken(session.accessToken);
        return session;
      },
      register: async (email, password) => {
        const session = await registerRequest(email, password);
        if (session) {
          setUser(session.user);
          setAccessToken(session.accessToken);
        }
        return session;
      },
      logout: async () => {
        await logoutRequest();
        setUser(null);
        setAccessToken(null);
      },
      refreshToken: async () => {
        try {
          const session = await refreshTokenRequest();
          setUser(session.user);
          setAccessToken(session.accessToken);
          return session;
        } catch (error) {
          clearPersistedSession();
          setUser(null);
          setAccessToken(null);
          throw error;
        }
      },
    }),
    [accessToken, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
