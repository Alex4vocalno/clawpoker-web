import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { clearToken, getToken, me, setToken, type ApiAgent, type ApiUser } from "@/lib/api";

interface AuthState {
  user: ApiUser | null;
  agents: ApiAgent[];
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: ApiUser) => void;
  logout: () => void;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  agents: [],
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  reload: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAgents([]);
      setLoading(false);
      return;
    }
    try {
      const res = await me();
      setUser(res.user);
      setAgents(res.agents);
    } catch {
      clearToken();
      setUser(null);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const login = useCallback((token: string, u: ApiUser) => {
    setToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setAgents([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        agents,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        reload
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
