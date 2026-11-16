// Audit N-04: times picked in a date-and-time field reach the server with the person's own time zone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const check = (tz) => spawnSync(process.execPath, ['--input-type=module', '-e', `
  const { withTimeZone } = await import(${JSON.stringify(new URL('../src/api/client.js', import.meta.url).href)});
  console.log(JSON.stringify(withTimeZone({ scheduledStart: '2026-11-16T10:00', list: [{ closesAt: '2026-11-16T10:00:30' }], day: '2026-11-16', time: '10:00', done: true, n: 3, iso: '2026-11-16T10:00:00.000Z' })));
`], { env: { ...process.env, TZ: tz }, encoding: 'utf8' });

test('N-04: a 10:00 class picked in Riyadh is sent as 07:00 UTC; dates and plain times are untouched', () => {
  const r = check('Asia/Riyadh');
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.scheduledStart, '2026-11-16T07:00:00.000Z');
  assert.equal(out.list[0].closesAt, '2026-11-16T07:00:30.000Z');
  assert.equal(out.day, '2026-11-16');
  assert.equal(out.time, '10:00');
  assert.equal(out.done, true);
  assert.equal(out.n, 3);
  assert.equal(out.iso, '2026-11-16T10:00:00.000Z', 'a time that already has a zone is not changed');
});

test('N-04: the same picked time in Karachi is sent as 05:00 UTC', () => {
  const out = JSON.parse(check('Asia/Karachi').stdout);
  assert.equal(out.scheduledStart, '2026-11-16T05:00:00.000Z');
});
