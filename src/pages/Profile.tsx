import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Shield, Wifi, WifiOff, Lock, Trash2, AlertTriangle, Database } from 'lucide-react';
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
import { useSyncListener } from '@/hooks/useSyncListener';
import { getProfile } from '@/lib/db';
import { clearLocalData } from '@/lib/sync';
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
  const { user, signOut, isOnline, isAuthenticated, deleteAccount } = useAuth();
  const { totalWorkouts, totalVolume, streak, refresh } = useAnalytics();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showClearData, setShowClearData] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setProfile(p || null));
  }, []);

  useSyncListener(() => {
    getProfile().then((p) => setProfile(p || null));
  });

  const handleSave = (updated: ProfileType) => {
    setProfile(updated);
    setShowEdit(false);
  };

  const handleClearData = async () => {
    await clearLocalData();
    setProfile(null);
    refresh();
    setShowClearData(false);
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

              <Button variant="secondary" fullWidth onClick={signOut}>
                <LogOut size={18} />
                Sign Out
              </Button>

              <Card padding="none">
                <button
                  onClick={() => setShowClearData(true)}
                  className="w-full flex items-center gap-3 p-4 active:bg-surface-800/50 transition-colors"
                >
                  <Database size={18} className="text-amber-400" />
                  <div className="text-left">
                    <span className="text-sm font-medium">Clear Local Data</span>
                    <p className="text-xs text-surface-500">Remove cached workouts from this device</p>
                  </div>
                </button>
              </Card>

              <Card padding="none">
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full flex items-center gap-3 p-4 active:bg-surface-800/50 transition-colors"
                >
                  <Trash2 size={18} className="text-danger-400" />
                  <div className="text-left">
                    <span className="text-sm font-medium text-danger-400">Delete Account</span>
                    <p className="text-xs text-surface-500">Permanently remove your account and all data</p>
                  </div>
                </button>
              </Card>
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
      <Modal open={showAuth} onClose={() => setShowAuth(false)}>
        <AuthForm onClose={() => setShowAuth(false)} />
      </Modal>

      {/* Change password modal */}
      <Modal open={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <ChangePasswordForm onClose={() => setShowChangePassword(false)} />
      </Modal>

      {/* Clear data confirmation modal */}
      <Modal open={showClearData} onClose={() => setShowClearData(false)} size="sm">
        <ClearDataConfirm
          onConfirm={handleClearData}
          onCancel={() => setShowClearData(false)}
        />
      </Modal>

      {/* Delete account confirmation modal */}
      <Modal open={showDeleteAccount} onClose={() => setShowDeleteAccount(false)} size="sm">
        <DeleteAccountConfirm onClose={() => setShowDeleteAccount(false)} />
      </Modal>
    </PageContainer>
  );
};

// ── Auth Form (username + password) ──
import { User, KeyRound, UserPlus, LogIn as LogInIcon } from 'lucide-react';

const AuthForm = ({ onClose }: { onClose: () => void }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';

  const switchMode = () => {
    setMode(isSignUp ? 'signin' : 'signup');
    setError('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const fn = isSignUp ? signUp : signIn;
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="text-center pb-1">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-3">
          {isSignUp ? (
            <UserPlus size={24} className="text-brand-400" />
          ) : (
            <LogInIcon size={24} className="text-brand-400" />
          )}
        </div>
        <h2 className="text-xl font-bold">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-sm text-surface-400 mt-1">
          {isSignUp
            ? 'Sign up to sync workouts across all your devices'
            : 'Sign in to access your workouts and progress'}
        </p>
      </div>

      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={isSignUp ? 'Choose a username' : 'Enter your username'}
        icon={<User size={18} />}
        autoComplete="username"
        required
      />
      {isSignUp && (
        <p className="text-xs text-surface-500 -mt-2 ml-1">3–20 characters, lowercase</p>
      )}

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
        icon={<KeyRound size={18} />}
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
        required
      />
      {isSignUp && (
        <p className="text-xs text-surface-500 -mt-2 ml-1">4–64 characters</p>
      )}

      {isSignUp && (
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          icon={<KeyRound size={18} />}
          autoComplete="new-password"
          required
        />
      )}

      {error && (
        <p className="text-sm text-danger-400 bg-danger-500/10 rounded-xl p-3">{error}</p>
      )}

      <Button variant="primary" size="lg" fullWidth type="submit" loading={loading}>
        {isSignUp ? 'Create Account' : 'Sign In'}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface-900 px-3 text-xs text-surface-500">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={switchMode}
        className="w-full text-center text-sm text-brand-400 hover:text-brand-300 font-medium py-2"
      >
        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
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

// ── Clear Data Confirmation ──
const ClearDataConfirm = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
        <Database size={28} className="text-amber-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold">Clear Local Data?</h3>
        <p className="text-sm text-surface-400 mt-1">
          This removes all cached workout data from this device. Your cloud data stays safe and will sync back on next login.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" fullWidth onClick={handleConfirm} loading={loading}>
          Clear Data
        </Button>
      </div>
    </div>
  );
};

// ── Delete Account Confirmation ──
const DeleteAccountConfirm = ({ onClose }: { onClose: () => void }) => {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canDelete = confirmText === 'DELETE' && password.length > 0;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;
    setError('');
    setLoading(true);

    const result = await deleteAccount(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <form onSubmit={handleDelete} className="space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger-500/15 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={28} className="text-danger-400" />
        </div>
        <h3 className="text-lg font-bold">Delete Account?</h3>
        <p className="text-sm text-surface-400 mt-1">
          This <span className="text-danger-400 font-semibold">permanently deletes</span> your account, all workouts, exercises, and progress. This cannot be undone.
        </p>
      </div>

      <Input
        label="Enter your password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        icon={<KeyRound size={18} />}
        required
      />

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Type <span className="text-danger-400 font-mono">DELETE</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="w-full rounded-xl border border-surface-700 bg-surface-800 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-danger-500/50 focus:border-danger-500 placeholder:text-surface-600"
        />
      </div>

      {error && (
        <p className="text-sm text-danger-400 bg-danger-500/10 rounded-xl p-3">{error}</p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          variant="danger"
          fullWidth
          type="submit"
          loading={loading}
          disabled={!canDelete}
        >
          <Trash2 size={16} />
          Delete Forever
        </Button>
      </div>
    </form>
  );
};
