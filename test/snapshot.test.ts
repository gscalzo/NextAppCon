import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { PLAN } from '../src/data/plan.ts';
import type { AgendaCache } from '../src/lib/types.ts';
import { DEFAULT_SESSIONIZE_ID } from '../src/state/agendaSource.ts';

const snapshot = JSON.parse(
  readFileSync(new URL('../src/data/agenda-snapshot.json', import.meta.url), 'utf8'),
) as AgendaCache;

test('bundled agenda is the default event, 2026 talks only', () => {
  assert.equal(snapshot.sessionizeId, DEFAULT_SESSIONIZE_ID);
  assert.ok(snapshot.sessions.length > 0);
  for (const s of snapshot.sessions) assert.equal(new Date(s.startsAt).getUTCFullYear(), 2026, s.id);
});

test('bundled agenda has a bio for every speaker of its talks', () => {
  const speakerIds = new Set(snapshot.speakers?.map((sp) => sp.id));
  for (const s of snapshot.sessions) {
    for (const id of s.speakerIds) assert.ok(speakerIds.has(id), `${s.id} speaker ${id}`);
  }
});

test('bundled agenda contains every talk of the plan', () => {
  const ids = new Set(snapshot.sessions.map((s) => s.id));
  for (const slot of PLAN) {
    for (const id of [slot.id, ...slot.alternatives.map((a) => a.id)]) assert.ok(ids.has(id), id);
  }
});
