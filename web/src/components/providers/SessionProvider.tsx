'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface SessionUser { id: number; name: string; email: string; isVip: boolean }
const SessionContext = createContext<{
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}>({ user: null, loading: true, refresh: async () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(() => fetch('/api/auth/session', { cache: 'no-store' })
    .then(async (response) => {
      const data = await response.json();
      setUser(response.ok ? data.user : null);
    }).catch(() => setUser(null)).finally(() => setLoading(false)), []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <SessionContext.Provider value={{ user, loading, refresh }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
