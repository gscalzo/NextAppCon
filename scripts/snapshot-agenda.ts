// Downloads the default Sessionize event and writes the agenda the app ships with,
// so a fresh install shows talks and speakers before its first network refresh.
// Run: npm run snapshot-agenda
import { writeFileSync } from 'node:fs';

import type { AgendaCache } from '../src/lib/types.ts';
import { DEFAULT_SESSIONIZE_ID, fetchAgenda } from '../src/state/agendaSource.ts';

const out = new URL('../src/data/agenda-snapshot.json', import.meta.url);
const { sessions, speakers } = await fetchAgenda([DEFAULT_SESSIONIZE_ID]);
const snapshot: AgendaCache = { sessionizeId: DEFAULT_SESSIONIZE_ID, fetchedAt: Date.now(), sessions, speakers };
writeFileSync(out, `${JSON.stringify(snapshot)}\n`);
console.log(`Wrote ${sessions.length} sessions and ${speakers.length} speakers to ${out.pathname}`);
