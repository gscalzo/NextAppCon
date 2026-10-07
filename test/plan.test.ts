import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PLAN } from '../src/data/plan.ts';
import { toggled, withNote } from '../src/lib/personal.ts';
import { indexPlan, otherOptions, seedFavourites } from '../src/lib/plan.ts';
import { reminderText } from '../src/lib/reminders.ts';
import { nowLineIndex } from '../src/lib/schedule.ts';
import { parseEventTime } from '../src/lib/time.ts';
import type { Session } from '../src/lib/types.ts';

const talk = (over: Partial<Session> = {}): Session => ({
  id: '1', title: 'Talk', description: '', room: 'agentic codingCon 1', track: null, speakers: ['Ada'], speakerIds: ['ada'],
  isService: false, startsAt: parseEventTime('2026-10-07T10:20:00'), endsAt: parseEventTime('2026-10-07T11:00:00'),
  ...over,
});

test('plan has the 24 route slots, one keynote and 34 alternatives', () => {
  assert.equal(PLAN.length, 24);
  assert.equal(PLAN.filter((s) => s.kind === 'keynote').length, 1);
  assert.equal(PLAN.reduce((n, s) => n + s.alternatives.length, 0), 34);
  assert.equal(PLAN.filter((s) => s.topPick).map((s) => s.id).join(), '1338782');
  assert.equal(indexPlan(PLAN).size, 58);
});

test('plan index and other options', () => {
  const index = indexPlan(PLAN);
  const alt = index.get('1290844')!;
  assert.equal(alt.role, 'alternative');
  assert.equal(alt.slot.id, '1291264');
  assert.deepEqual(otherOptions(alt, '1290844').map((o) => o.id), ['1291264', '1275484']);
  assert.deepEqual(otherOptions(index.get('1291264')!, '1291264').map((o) => o.id), ['1275484', '1290844']);
});

test('seeding keeps existing favourites and adds the picks only', () => {
  const favs = seedFavourites(['x'], PLAN);
  assert.equal(favs.size, 25);
  assert.ok(favs.has('x') && favs.has('1274909') && !favs.has('1279115'));
});

test('reminder says where to go', () => {
  assert.deepEqual(reminderText(talk()), {
    title: 'Go to agentic codingCon 1 · 10:20',
    body: 'Talk — Ada',
  });
  const keynote = indexPlan(PLAN).get('1274909');
  const k = reminderText(talk({ id: '1274909', title: 'Just One More Prompt' }), keynote);
  assert.equal(k.title, 'Your keynote starts at 10:20');
  assert.equal(k.body, 'Go to agentic codingCon 1 · “Just One More Prompt”');
});

test('now line position', () => {
  const at = (t: string) => parseEventTime(`2026-10-07T${t}:00`);
  const items = [
    { startsAt: at('09:00'), endsAt: at('10:00') },
    { startsAt: at('10:20'), endsAt: at('11:00') },
  ];
  assert.equal(nowLineIndex(items, at('08:00')), -1);
  assert.equal(nowLineIndex(items, at('09:30')), 1);
  assert.equal(nowLineIndex(items, at('10:10')), 1);
  assert.equal(nowLineIndex(items, at('10:30')), 2);
  assert.equal(nowLineIndex(items, at('11:00')), -1);
  assert.equal(nowLineIndex([], at('10:00')), -1);
});

test('withNote stores, replaces and clears a talk note', () => {
  const empty = {};
  const one = withNote(empty, 'a', 'Great demo');
  assert.deepEqual(one, { a: 'Great demo' });
  assert.deepEqual(empty, {}, 'does not mutate');
  assert.equal(withNote(one, 'a', 'Great demo'), one, 'unchanged text keeps identity');
  assert.deepEqual(withNote(one, 'a', '   '), {});
  assert.equal(withNote(empty, 'b', ''), empty);
});

test('toggled adds and removes an attended id', () => {
  const on = toggled(new Set(), 'a');
  assert.deepEqual([...on], ['a']);
  assert.deepEqual([...toggled(on, 'a')], []);
  assert.deepEqual([...on], ['a'], 'does not mutate');
});
