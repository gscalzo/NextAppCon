import { useEffect, useState } from 'react';

import { currentOrNextFav } from '../lib/schedule.ts';
import { useAgenda } from '../state/AgendaContext.tsx';

/** Current time, re-rendering every `intervalMs`. */
export function useNow(intervalMs = 15_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** The favourite running now, or the next one, plus the current time. */
export function useNowNext() {
  const { favs } = useAgenda();
  const now = useNow();
  return { now, upcoming: currentOrNextFav(favs, now) };
}
