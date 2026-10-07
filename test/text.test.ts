import assert from 'node:assert/strict';
import { test } from 'node:test';

import { noOrphan } from '../src/lib/text.ts';

test('noOrphan keeps the last two words together', () => {
  assert.equal(noOrphan('Skill in the Agentic Era'), 'Skill in the Agentic Era');
  assert.equal(noOrphan('  Burn down   the bridges! '), 'Burn down the bridges!');
});

test('noOrphan leaves short titles and long last words alone', () => {
  assert.equal(noOrphan('Lunch'), 'Lunch');
  assert.equal(noOrphan('Agentic Era'), 'Agentic Era');
  assert.equal(noOrphan('Meet the Supercalifragilistic'), 'Meet the Supercalifragilistic');
});
