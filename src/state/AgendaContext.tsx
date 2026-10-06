import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { findClashes } from '../lib/schedule.ts';
import { formatTime } from '../lib/time.ts';
import type { AgendaCache, Session } from '../lib/types.ts';
import { discoverSessionizeIds, fetchSessions } from './agendaSource.ts';
import { ensureNotificationPermission, rescheduleReminders } from './notifications.ts';
import { storage } from './storage.ts';

const STALE_AFTER_MS = 30 * 60_000;
const NO_SESSIONS: Session[] = [];

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string };

type AgendaState = {
  ready: boolean;
  sessions: Session[];
  sessionsById: Map<string, Session>;
  fetchedAt: number | null;
  sourceIds: string[];
  manualIds: string[];
  status: Status;
  favIds: Set<string>;
  favs: Session[];
  remindersScheduled: number | null;
  notificationsAllowed: boolean | null;
  refresh: () => Promise<void>;
  setManualIds: (ids: string[]) => Promise<void>;
  toggleFav: (session: Session) => void;
};

const AgendaContext = createContext<AgendaState | null>(null);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<AgendaCache | null>(null);
  const [manualIds, setManualIdsState] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [remindersScheduled, setRemindersScheduled] = useState<number | null>(null);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);
  const refreshing = useRef(false);

  const refreshWith = useCallback(async (ids: string[], current: AgendaCache | null) => {
    if (refreshing.current) return;
    refreshing.current = true;
    setStatus({ kind: 'loading' });
    try {
      let sourceIds = ids.length ? ids : current?.sessionizeId.split(',').filter(Boolean) ?? [];
      if (sourceIds.length === 0) sourceIds = await discoverSessionizeIds();
      if (sourceIds.length === 0) {
        throw new Error(
          'Could not find the Sessionize agenda on nextappcon.com. Enter the Sessionize ID in Settings.',
        );
      }
      const sessions = await fetchSessions(sourceIds);
      const next: AgendaCache = { sessionizeId: sourceIds.join(','), fetchedAt: Date.now(), sessions };
      setCache(next);
      await storage.saveAgenda(next);
      setStatus({ kind: 'idle' });
    } catch (e) {
      setStatus({ kind: 'error', message: (e as Error).message });
    } finally {
      refreshing.current = false;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [agenda, favs, ids] = await Promise.all([
        storage.loadAgenda(),
        storage.loadFavs(),
        storage.loadManualIds(),
      ]);
      setCache(agenda);
      setFavIds(new Set(favs));
      setManualIdsState(ids);
      setReady(true);
      setNotificationsAllowed(await ensureNotificationPermission().catch(() => false));
      if (!agenda || Date.now() - agenda.fetchedAt > STALE_AFTER_MS) await refreshWith(ids, agenda);
    })();
  }, [refreshWith]);

  const sessions = cache?.sessions ?? NO_SESSIONS;
  const sessionsById = useMemo(() => new Map(sessions.map((s) => [s.id, s])), [sessions]);
  const favs = useMemo(
    () => sessions.filter((s) => favIds.has(s.id)),
    [sessions, favIds],
  );

  // Keep reminders in sync with favs and with agenda changes (moved talks).
  useEffect(() => {
    if (!ready || !notificationsAllowed) return;
    rescheduleReminders(favs).then(setRemindersScheduled).catch(() => setRemindersScheduled(null));
  }, [ready, notificationsAllowed, favs]);

  const saveFavs = useCallback((next: Set<string>) => {
    setFavIds(next);
    storage.saveFavs([...next]);
  }, []);

  const toggleFav = useCallback(
    (session: Session) => {
      if (favIds.has(session.id)) {
        const next = new Set(favIds);
        next.delete(session.id);
        saveFavs(next);
        return;
      }
      const add = (replace: Session[] = []) => {
        const next = new Set(favIds);
        for (const s of replace) next.delete(s.id);
        next.add(session.id);
        saveFavs(next);
      };
      const clashes = findClashes(session, favs);
      if (clashes.length === 0) return add();
      const list = clashes
        .map((c) => `• ${formatTime(c.startsAt)}–${formatTime(c.endsAt)} ${c.title}${c.room ? ` (${c.room})` : ''}`)
        .join('\n');
      Alert.alert(
        'Clashes with your favourites',
        `“${session.title}” overlaps with:\n\n${list}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Keep both', onPress: () => add() },
          { text: clashes.length > 1 ? 'Replace them' : 'Replace it', style: 'destructive', onPress: () => add(clashes) },
        ],
      );
    },
    [favIds, favs, saveFavs],
  );

  const setManualIds = useCallback(
    async (ids: string[]) => {
      setManualIdsState(ids);
      await storage.saveManualIds(ids);
      await refreshWith(ids, null);
    },
    [refreshWith],
  );

  const value: AgendaState = {
    ready,
    sessions,
    sessionsById,
    fetchedAt: cache?.fetchedAt ?? null,
    sourceIds: cache?.sessionizeId.split(',').filter(Boolean) ?? [],
    manualIds,
    status,
    favIds,
    favs,
    remindersScheduled,
    notificationsAllowed,
    refresh: () => refreshWith(manualIds, cache),
    setManualIds,
    toggleFav,
  };

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
}

export function useAgenda(): AgendaState {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be used inside AgendaProvider');
  return ctx;
}
