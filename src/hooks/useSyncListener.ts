import { useEffect, useCallback, useRef } from 'react';

/**
 * Calls the given callback whenever remote sync completes.
 * Use to re-read IndexedDB after new data arrives.
 */
export const useSyncListener = (callback: () => void) => {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  const handler = useCallback(() => {
    cbRef.current();
  }, []);

  useEffect(() => {
    window.addEventListener('ezgym:synced', handler);
    return () => window.removeEventListener('ezgym:synced', handler);
  }, [handler]);
};
