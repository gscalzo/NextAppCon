import assert from 'node:assert/strict';
import { test } from 'node:test';

import { clashingIds, currentOrNextFav, findClashes, groupByDay, overlaps } from '../src/lib/schedule.ts';
import { normalizeSessionizeId, parseSessionizeAll, parseSessionizeSpeakers } from '../src/lib/sessionize.ts';
import { formatCountdown, formatDayLabel, formatTime, parseEventTime } from '../src/lib/time.ts';
import type { Session } from '../src/lib/types.ts';

const fixture = {
  sessions: [
    {
      id: '101', title: ' Compose deep dive ', description: 'Desc', startsAt: '2026-10-07T10:00:00',
      endsAt: '2026-10-07T10:40:00', isServiceSession: false, speakers: ['s1'], categoryItems: [2, 11], roomId: 1,
    },
    {
      id: '102', title: 'Swift macros', description: null, startsAt: '2026-10-07T10:20:00',
      endsAt: '2026-10-07T11:00:00', isServiceSession: false, speakers: ['s2'], categoryItems: [12], roomId: 2,
    },
    {
      id: '103', title: 'Lunch', startsAt: '2026-10-07T12:00:00', endsAt: '2026-10-07T13:00:00',
      isServiceSession: true, speakers: [], categoryItems: [], roomId: null,
    },
    { id: '104', title: 'Unscheduled', startsAt: null, endsAt: null, speakers: [], categoryItems: [] },
  ],
  speakers: [
    {
      id: 's1', fullName: 'Ada Droid', tagLine: ' Android GDE ', bio: ' Writes Compose. ',
      profilePicture: 'https://cdn.sessionize.com/image/ada.png',
      links: [{ title: 'LinkedIn', url: 'https://linkedin.com/in/ada' }, { title: 'Broken' }],
    },
    { id: 's2', firstName: 'Tim', lastName: 'Swift' },
  ],
  categories: [
    { id: 1, title: 'Session format', items: [{ id: 2, name: 'Talk' }] },
    { id: 10, title: 'Conference', items: [{ id: 11, name: 'droidCon' }, { id: 12, name: 'swiftCon' }] },
  ],
  rooms: [{ id: 1, name: 'Stage A' }, { id: 2, name: 'Stage B' }],
};

const mk = (id: string, start: string, end: string): Session => ({
  id, title: id, description: '', room: '', track: null, speakers: [], speakerIds: [], isService: false,
  startsAt: parseEventTime(start), endsAt: parseEventTime(end),
});

test('Berlin local time converts to UTC with summer and winter offsets', () => {
  assert.equal(parseEventTime('2026-10-07T10:00:00'), Date.parse('2026-10-07T08:00:00Z'));
  assert.equal(parseEventTime('2026-11-07T10:00:00'), Date.parse('2026-11-07T09:00:00Z'));
  assert.equal(parseEventTime('2026-10-07T10:00:00Z'), Date.parse('2026-10-07T10:00:00Z'));
  assert.equal(formatTime(Date.parse('2026-10-07T08:05:00Z')), '10:05');
  assert.equal(formatDayLabel('2026-10-07'), 'Wed 7 Oct');
});

test('countdown formatting', () => {
  assert.equal(formatCountdown(0, 4.5 * 60_000), 'in 5 min');
  assert.equal(formatCountdown(0, 65 * 60_000), 'in 1 h 05 min');
  assert.equal(formatCountdown(10, 0), 'now');
});

test('parses Sessionize All view with track, room and speakers', () => {
  const sessions = parseSessionizeAll(fixture);
  assert.equal(sessions.length, 3);
  const [compose, swift, lunch] = sessions;
  assert.equal(compose.title, 'Compose deep dive');
  assert.equal(compose.track, 'droidCon');
  assert.equal(compose.room, 'Stage A');
  assert.deepEqual(compose.speakers, ['Ada Droid']);
  assert.deepEqual(compose.speakerIds, ['s1']);
  assert.equal(swift.track, 'swiftCon');
  assert.deepEqual(swift.speakers, ['Tim Swift']);
  assert.equal(swift.description, '');
  assert.equal(lunch.isService, true);
  assert.equal(lunch.room, '');
  assert.throws(() => parseSessionizeAll({ foo: 1 }));
});

test('parses speaker bios, taglines, photos and links', () => {
  const [ada, tim] = parseSessionizeSpeakers(fixture);
  assert.deepEqual(ada, {
    id: 's1', name: 'Ada Droid', tagLine: 'Android GDE', bio: 'Writes Compose.',
    photoUrl: 'https://cdn.sessionize.com/image/ada.png',
    links: [{ title: 'LinkedIn', url: 'https://linkedin.com/in/ada' }],
  });
  assert.deepEqual(tim, { id: 's2', name: 'Tim Swift', tagLine: '', bio: '', photoUrl: null, links: [] });
});

test('track comes from the PRIMARY event category, not "other events"', () => {
  const data = {
    sessions: [
      {
        id: '1', title: 'Talk', startsAt: '2026-10-07T10:00:00', endsAt: '2026-10-07T10:40:00',
        speakers: [], categoryItems: [21, 31, 32, 33], roomId: null,
      },
    ],
    categories: [
      { id: 2, title: 'Choose the PRIMARY event you are submitting for', items: [{ id: 21, name: 'swiftCon' }] },
      {
        id: 3, title: 'Which other events is your talk relevant for?',
        items: [{ id: 31, name: 'droidCon' }, { id: 32, name: 'flutterCon' }, { id: 33, name: 'reactCon' }],
      },
    ],
  };
  assert.equal(parseSessionizeAll(data)[0].track, 'swiftCon');
});

test('clash detection: overlap counts, back-to-back does not', () => {
  const a = mk('a', '2026-10-07T10:00:00', '2026-10-07T10:40:00');
  const b = mk('b', '2026-10-07T10:35:00', '2026-10-07T11:00:00');
  const c = mk('c', '2026-10-07T10:40:00', '2026-10-07T11:20:00');
  assert.equal(overlaps(a, b), true);
  assert.equal(overlaps(a, c), false);
  assert.deepEqual(findClashes(b, [a, c]).map((s) => s.id), ['a', 'c']);
  assert.deepEqual(findClashes(a, [a]), []);
  assert.deepEqual([...clashingIds([c, a, b])].sort(), ['a', 'b', 'c']);
  assert.deepEqual([...clashingIds([a, c])], []);
});

test('current or next fav', () => {
  const a = mk('a', '2026-10-07T10:00:00', '2026-10-07T10:40:00');
  const b = mk('b', '2026-10-07T11:00:00', '2026-10-07T11:40:00');
  const at = (t: string) => parseEventTime(`2026-10-07T${t}:00`);
  assert.deepEqual(currentOrNextFav([a, b], at('09:00')), { session: a, running: false });
  assert.deepEqual(currentOrNextFav([a, b], at('10:10')), { session: a, running: true });
  assert.deepEqual(currentOrNextFav([a, b], at('10:55')), { session: b, running: false });
  assert.equal(currentOrNextFav([a, b], at('12:00')), null);
});

test('groups by Berlin day', () => {
  const late = mk('late', '2026-10-07T23:30:00', '2026-10-08T00:30:00');
  const next = mk('next', '2026-10-08T09:00:00', '2026-10-08T10:00:00');
  assert.deepEqual([...groupByDay([late, next]).keys()], ['2026-10-07', '2026-10-08']);
});

test('Sessionize ID normalisation', () => {
  assert.equal(normalizeSessionizeId('  ABC123xy '), 'abc123xy');
  assert.equal(normalizeSessionizeId('https://sessionize.com/api/v2/k9x2/view/All'), 'k9x2');
  assert.equal(normalizeSessionizeId('https://sessionize.com/api/v2/yak5yl8m/view/All'), 'yak5yl8m');
  assert.equal(normalizeSessionizeId('not an id!'), null);
});
