import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navigation } from '@/components/layout/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { Workout } from '@/pages/Workout';
import { Progress } from '@/pages/Progress';
import { Profile } from '@/pages/Profile';
import { startAutoSync, syncFromRemote } from '@/lib/sync';

function SyncManager({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnline } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;
    const stop = startAutoSync();
    syncFromRemote();
    return stop;
  }, [isAuthenticated, isOnline]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SyncManager>
            <div className="min-h-screen bg-surface-950">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/workout" element={<Workout />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
              <Navigation />
            </div>
          </SyncManager>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
