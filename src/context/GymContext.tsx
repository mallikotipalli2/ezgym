import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { getActiveGymSession, createGymSession, updateGymSession } from '@/lib/db';
import { generateId } from '@/lib/utils';
import type { GymSession } from '@/types';

interface GymContextState {
  isAtGym: boolean;
  session: GymSession | null;
  elapsedMs: number;
  startGym: () => Promise<void>;
  stopGym: () => Promise<'completed' | 'short'>;
  resumeGym: () => void;
  discardSession: () => Promise<void>;
  confirmShortSession: () => Promise<void>;
}

const GymContext = createContext<GymContextState | undefined>(undefined);

const GYM_STORAGE_KEY = 'ezgym:gym-active';
const MIN_SESSION_MS = 5 * 60 * 1000; // 5 minutes

export const GymProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<GymSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingSessionRef = useRef<GymSession | null>(null);

  const startTimer = useCallback((startedAt: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    setElapsedMs(Date.now() - new Date(startedAt).getTime());
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Restore active session on mount
  useEffect(() => {
    getActiveGymSession().then((s) => {
      if (s) {
        setSession(s);
        startTimer(s.startedAt);
      }
    });
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const startGym = useCallback(async () => {
    const newSession: GymSession = {
      id: generateId(),
      startedAt: new Date().toISOString(),
      durationMs: 0,
      status: 'active',
      synced: false,
    };
    await createGymSession(newSession);
    setSession(newSession);
    startTimer(newSession.startedAt);
    localStorage.setItem(GYM_STORAGE_KEY, 'true');
  }, [startTimer]);

  const stopGym = useCallback(async (): Promise<'completed' | 'short'> => {
    if (!session) return 'completed';
    stopTimer();

    const duration = Date.now() - new Date(session.startedAt).getTime();

    if (duration < MIN_SESSION_MS) {
      // Under 5 min — let caller decide
      pendingSessionRef.current = { ...session, durationMs: duration, endedAt: new Date().toISOString() };
      return 'short';
    }

    await updateGymSession(session.id, {
      status: 'completed',
      endedAt: new Date().toISOString(),
      durationMs: duration,
    });
    setSession(null);
    setElapsedMs(0);
    localStorage.removeItem(GYM_STORAGE_KEY);
    return 'completed';
  }, [session, stopTimer]);

  const resumeGym = useCallback(() => {
    pendingSessionRef.current = null;
    if (session) {
      startTimer(session.startedAt);
    }
  }, [session, startTimer]);

  const confirmShortSession = useCallback(async () => {
    const pending = pendingSessionRef.current;
    if (!pending) return;
    await updateGymSession(pending.id, {
      status: 'completed',
      endedAt: pending.endedAt,
      durationMs: pending.durationMs,
    });
    pendingSessionRef.current = null;
    setSession(null);
    setElapsedMs(0);
    localStorage.removeItem(GYM_STORAGE_KEY);
  }, []);

  const discardSession = useCallback(async () => {
    const id = pendingSessionRef.current?.id || session?.id;
    if (!id) return;
    await updateGymSession(id, { status: 'discarded' });
    pendingSessionRef.current = null;
    setSession(null);
    setElapsedMs(0);
    stopTimer();
    localStorage.removeItem(GYM_STORAGE_KEY);
  }, [session, stopTimer]);

  return (
    <GymContext.Provider
      value={{
        isAtGym: !!session && session.status === 'active',
        session,
        elapsedMs,
        startGym,
        stopGym,
        resumeGym,
        discardSession,
        confirmShortSession,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = (): GymContextState => {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error('useGym must be used within GymProvider');
  return ctx;
};
