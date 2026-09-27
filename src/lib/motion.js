import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion() {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches;
  const [reduced, setReduced] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
