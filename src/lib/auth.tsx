import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "./api/client";
import type { PublicUser } from "./api/types";

const STORAGE_KEY = "scanpay.session";

interface AuthValue {
  user: PublicUser | null;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<PublicUser>;
  register: (input: Parameters<typeof api.register>[0]) => Promise<PublicUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as PublicUser);
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      async login(identifier, password) {
        const u = await api.login(identifier, password);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },
      async register(input) {
        const u = await api.register(input);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        setUser(u);
        return u;
      },
      logout() {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
