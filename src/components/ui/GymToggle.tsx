import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Square } from 'lucide-react';
import { useGym } from '@/context/GymContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function formatStopwatch(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export const GymToggle = () => {
  const { isAtGym, elapsedMs, startGym, stopGym, discardSession, confirmShortSession } = useGym();
  const [showShortModal, setShowShortModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(false);

  const handleToggle = async () => {
    if (!isAtGym) {
      await startGym();
    } else {
      const result = await stopGym();
      if (result === 'short') {
        setShowShortModal(true);
      }
    }
  };

  const handleKeep = async () => {
    setPendingAction(true);
    await confirmShortSession();
    setShowShortModal(false);
    setPendingAction(false);
  };

  const handleDiscard = async () => {
    setPendingAction(true);
    await discardSession();
    setShowShortModal(false);
    setPendingAction(false);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleToggle}
        className={`
          relative flex items-center gap-1.5 h-9 rounded-xl border text-xs font-bold
          transition-all duration-300 overflow-hidden
          ${isAtGym
            ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-500/50 text-emerald-400 pl-2.5 pr-3'
            : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-white hover:border-surface-500 px-2.5'
          }
        `}
      >
        {isAtGym ? (
          <>
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="whitespace-nowrap">@GYM</span>
            <span className="font-mono text-[11px] text-emerald-300 tabular-nums ml-0.5">
              {formatStopwatch(elapsedMs)}
            </span>
          </>
        ) : (
          <>
            <Timer size={15} />
            <span>@GYM</span>
          </>
        )}
      </motion.button>

      {/* Short session modal */}
      <AnimatePresence>
        {showShortModal && (
          <Modal open={showShortModal} onClose={() => {}} size="sm">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
                <Timer size={28} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Short Session</h3>
                <p className="text-sm text-surface-400 mt-1">
                  Your gym session was under 5 minutes ({formatStopwatch(elapsedMs)}).
                  Would you like to keep or discard this log?
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleDiscard}
                  loading={pendingAction}
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleKeep}
                  loading={pendingAction}
                >
                  Keep Log
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};
