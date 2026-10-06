import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';

import { PLAN } from '../data/plan.ts';
import { toggled, withNote, type TalkNotes } from '../lib/personal.ts';
import { indexPlan, seedFavourites, type PlanEntry } from '../lib/plan.ts';
import { findClashes } from '../lib/schedule.ts';
import { formatTime } from '../lib/time.ts';
import type { AgendaCache, Session } from '../lib/types.ts';
import { DEFAULT_SESSIONIZE_ID, fetchSessions } from './agendaSource.ts';
import { ensureNotificationPermission, rescheduleReminders } from './notifications.ts';
import { storage } from './storage.ts';

const STALE_AFTER_MS = 30 * 60_000;
const NO_SESSIONS: Session[] = [];
const PLAN_INDEX = indexPlan(PLAN);

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
  planEntry: (sessionId: string) => PlanEntry | undefined;
  refresh: () => Promise<void>;
  setManualIds: (ids: string[]) => Promise<void>;
  toggleFav: (session: Session) => void;
  /** Favs `session` and drops every favourite that overlaps it. */
  switchTo: (session: Session) => void;
  /** Replaces all favourites with the plan's original picks. */
  resetToPlan: () => void;
  notes: TalkNotes;
  /** Stores a personal note for a talk; blank text deletes it. */
  setNote: (sessionId: string, text: string) => void;
  attendedIds: Set<string>;
  toggleAttended: (sessionId: string) => void;
};

const AgendaContext = createContext<AgendaState | null>(null);

const planEntry = (sessionId: string) => PLAN_INDEX.get(sessionId);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cache, setCache] = useState<AgendaCache | null>(null);
  const [manualIds, setManualIdsState] = useState<string[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<TalkNotes>({});
  const [attendedIds, setAttendedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [remindersScheduled, setRemindersScheduled] = useState<number | null>(null);
  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);
  const refreshing = useRef(false);

  const refreshWith = useCallback(async (ids: string[], current: AgendaCache | null) => {
    if (refreshing.current) return;
    refreshing.current = true;
    setStatus({ kind: 'loading' });
    try {
      const cachedIds = current?.sessionizeId.split(',').filter(Boolean) ?? [];
      const sourceIds = ids.length ? ids : cachedIds.length ? cachedIds : [DEFAULT_SESSIONIZE_ID];
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
      const [agenda, storedFavs, ids, planImported, storedNotes, attended] = await Promise.all([
        storage.loadAgenda(),
        storage.loadFavs(),
        storage.loadManualIds(),
        storage.loadPlanImported(),
        storage.loadNotes(),
        storage.loadAttended(),
      ]);
      // The plan is imported once; later un-favs stick.
      const favs = planImported ? new Set(storedFavs) : seedFavourites(storedFavs, PLAN);
      if (!planImported) {
        await storage.saveFavs([...favs]);
        await storage.savePlanImported();
      }
      setCache(agenda);
      setFavIds(favs);
      setManualIdsState(ids);
      setNotes(storedNotes);
      setAttendedIds(new Set(attended));
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
    rescheduleReminders(favs, planEntry).then(setRemindersScheduled).catch(() => setRemindersScheduled(null));
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
        Haptics.selectionAsync();
        return;
      }
      const add = (replace: Session[] = []) => {
        const next = new Set(favIds);
        for (const s of replace) next.delete(s.id);
        next.add(session.id);
        saveFavs(next);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };
      const clashes = findClashes(session, favs);
      if (clashes.length === 0) return add();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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

  const switchTo = useCallback(
    (session: Session) => {
      const next = new Set(favIds);
      for (const c of findClashes(session, favs)) next.delete(c.id);
      next.add(session.id);
      saveFavs(next);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [favIds, favs, saveFavs],
  );

  const resetToPlan = useCallback(() => {
    saveFavs(new Set(PLAN.map((s) => s.id)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [saveFavs]);

  useEffect(() => {
    if (ready) storage.saveNotes(notes);
  }, [ready, notes]);

  const setNote = useCallback((sessionId: string, text: string) => {
    setNotes((current) => withNote(current, sessionId, text));
  }, []);

  const toggleAttended = useCallback(
    (sessionId: string) => {
      const next = toggled(attendedIds, sessionId);
      setAttendedIds(next);
      storage.saveAttended([...next]);
      Haptics.selectionAsync();
    },
    [attendedIds],
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
    planEntry,
    refresh: () => refreshWith(manualIds, cache),
    setManualIds,
    toggleFav,
    switchTo,
    resetToPlan,
    notes,
    setNote,
    attendedIds,
    toggleAttended,
  };

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
}

export function useAgenda(): AgendaState {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda must be used inside AgendaProvider');
  return ctx;
}
