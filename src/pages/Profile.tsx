import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Shield, Wifi, WifiOff, Lock } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { StatsCard } from '@/components/profile/StatsCard';
import { useAuth } from '@/context/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getProfile } from '@/lib/db';
import type { Profile as ProfileType } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const Profile = () => {
  const { user, signOut, isOnline, isAuthenticated } = useAuth();
  const { totalWorkouts, totalVolume, streak } = useAnalytics();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setProfile(p || null));
  }, []);

  const handleSave = (updated: ProfileType) => {
    setProfile(updated);
    setShowEdit(false);
  };

  return (
    <PageContainer>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
        <motion.div variants={item}>
          <Header title="Profile" />
        </motion.div>

        {/* Profile card */}
        <motion.div variants={item}>
          <Card padding="lg" className="text-center">
            <Avatar
              src={profile?.avatarUrl}
              name={profile?.name || user?.username}
              size="xl"
              className="mx-auto mb-3"
            />
            <h2 className="text-xl font-bold">
              {profile?.name || user?.username || 'Athlete'}
            </h2>
            <p className="text-sm text-surface-400 mt-0.5">
              {isAuthenticated ? `@${user?.username}` : 'Guest mode — local data only'}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              {isOnline ? (
                <Wifi size={14} className="text-success-400" />
              ) : (
                <WifiOff size={14} className="text-surface-500" />
              )}
              <span className="text-xs text-surface-400">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="mt-4"
            >
              Edit Profile
            </Button>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item}>
          <StatsCard
            totalWorkouts={totalWorkouts}
            totalVolume={totalVolume}
            streak={streak}
            memberSince={profile?.createdAt}
          />
        </motion.div>

        {/* Account */}
        <motion.div variants={item} className="space-y-3">
          <h3 className="text-sm font-semibold">Account</h3>

          {isAuthenticated ? (
            <div className="space-y-2">
              <Card padding="none">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center gap-3 p-4 active:bg-surface-800/50 transition-colors"
                >
                  <Lock size={18} className="text-surface-400" />
                  <span className="text-sm font-medium">Change Password</span>
                </button>
              </Card>
              <Button variant="danger" fullWidth onClick={signOut}>
                <LogOut size={18} />
                Sign Out
              </Button>
            </div>
          ) : (
            <Card padding="md">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sync your data</p>
                  <p className="text-xs text-surface-400 mt-1">
                    Create an account to sync workouts across devices and never lose your progress.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAuth(true)}
                    className="mt-3"
                  >
                    <LogIn size={16} />
                    Sign In / Register
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Version */}
        <motion.div variants={item} className="text-center py-4">
          <p className="text-xs text-surface-600">EzGym v1.0.0</p>
        </motion.div>
      </motion.div>

      {/* Edit profile modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <ProfileForm profile={profile} onSave={handleSave} />
      </Modal>

      {/* Auth modal */}
      <Modal open={showAuth} onClose={() => setShowAuth(false)} title="Sign In">
        <AuthForm onClose={() => setShowAuth(false)} />
      </Modal>

      {/* Change password modal */}
      <Modal open={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      </Modal>
    </PageContainer>
  );
};

// ── Auth Form (username + password) ──
import { User, KeyRound } from 'lucide-react';

const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fn = mode === 'signin' ? signIn : signUp;
    const result = await fn(username.trim(), password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="your_username"
        icon={<User size={18} />}
        autoComplete="username"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={<KeyRound size={18} />}
        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        required
      />

      {error && (
        <p className="text-sm text-danger-400 bg-danger-500/10 rounded-xl p-3">{error}</p>
      )}

      <Button variant="primary" size="lg" fullWidth type="submit" loading={loading}>
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </Button>

      <button
        type="button"
        onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
        className="w-full text-center text-sm text-brand-400 hover:text-brand-300"
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </form>
  );
};

// ── Change Password Form ──
const ChangePasswordForm = ({ onClose }: { onClose: () => void }) => {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await changePassword(currentPassword, newPassword);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(onClose, 1500);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <p className="text-success-400 font-semibold">Password changed successfully!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="••••••••"
        icon={<KeyRound size={18} />}
        required
      />
      <Input
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="••••••••"
        icon={<KeyRound size={18} />}
        required
      />

      {error && (
        <p className="text-sm text-danger-400 bg-danger-500/10 rounded-xl p-3">{error}</p>
      )}

      <Button variant="primary" size="lg" fullWidth type="submit" loading={loading}>
        Change Password
      </Button>
    </form>
  );
};
