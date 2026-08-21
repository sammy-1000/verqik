"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth/token-storage";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import type { AuthTokens, UserProfile } from "@/lib/ws/types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileType: "SENDER" | "TRAVELER" | "BOTH";
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    wsClient.setToken(token);
    wsClient.connect(token);
    const profile = await wsClient.rpc<UserProfile>(WsEvents.USERS_ME_GET);
    setUser(profile);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const unsubUser = wsClient.on(PushEvents.USER_UPDATED, (payload) => {
      const data = payload as { user?: UserProfile };
      if (data.user) setUser(data.user);
    });

    const unsubVerification = wsClient.on(PushEvents.VERIFICATION_UPDATED, () => {
      void refreshProfile();
    });

    return () => {
      unsubUser();
      unsubVerification();
    };
  }, [refreshProfile]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    refreshProfile()
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshProfile]);

  const handleAuthSuccess = useCallback(
    async (tokens: AuthTokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      wsClient.setToken(tokens.accessToken);
      wsClient.connect(tokens.accessToken);
      await refreshProfile();
      router.push("/app");
    },
    [refreshProfile, router],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      wsClient.disconnect();
      wsClient.setToken(null);
      wsClient.connect(null);
      const tokens = await wsClient.rpc<AuthTokens>(WsEvents.AUTH_LOGIN, {
        email,
        password,
      });
      await handleAuthSuccess(tokens);
      toast.success("Welcome back!");
    },
    [handleAuthSuccess],
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      profileType: "SENDER" | "TRAVELER" | "BOTH";
    }) => {
      wsClient.disconnect();
      wsClient.setToken(null);
      wsClient.connect(null);
      const tokens = await wsClient.rpc<AuthTokens>(WsEvents.AUTH_REGISTER, data);
      await handleAuthSuccess(tokens);
      toast.success("Account created!");
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(() => {
    clearTokens();
    wsClient.disconnect();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshProfile }),
    [user, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
