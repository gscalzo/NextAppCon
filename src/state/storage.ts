import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AgendaCache } from '../lib/types.ts';

const KEYS = {
  agenda: 'agenda:v1',
  favs: 'favs:v1',
  manualIds: 'sessionizeIds:v1',
  planImported: 'planImported:v1',
};

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const write = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value));

export const storage = {
  loadAgenda: () => read<AgendaCache>(KEYS.agenda),
  saveAgenda: (cache: AgendaCache) => write(KEYS.agenda, cache),
  loadFavs: async () => (await read<string[]>(KEYS.favs)) ?? [],
  saveFavs: (ids: string[]) => write(KEYS.favs, ids),
  loadManualIds: async () => (await read<string[]>(KEYS.manualIds)) ?? [],
  saveManualIds: (ids: string[]) => write(KEYS.manualIds, ids),
  loadPlanImported: async () => (await read<boolean>(KEYS.planImported)) ?? false,
  savePlanImported: () => write(KEYS.planImported, true),
};
