import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, session, ApiError } from '../src/api/client.js';

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
beforeEach(() => {
  const values = new Map();
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  } });
  session.set({ accessToken: 'expired-access', refreshToken: 'refresh-original' });
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete globalThis.localStorage;
});
const response = (status, data) => ({ ok: status < 400, status, json: async () => ({ data }) });

test('parallel unauthorized requests share a refresh and retry with the new access token', async () => {
  let refreshCalls = 0;
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCalls += 1;
      await new Promise((resolve) => setImmediate(resolve));
      return response(200, { accessToken: 'fresh-access', refreshToken: 'refresh-rotated' });
    }
    return options.headers.Authorization === 'Bearer fresh-access' ? response(200, 'loaded') : response(401);
  };
  assert.deepEqual(await Promise.all([apiRequest('/students/me'), apiRequest('/notifications')]), ['loaded', 'loaded']);
  assert.equal(refreshCalls, 1);
  assert.equal(session.getRefreshToken(), 'refresh-rotated');
});
test('logout during a pending refresh cannot restore the session', async () => {
  let release;
  let started;
  const refreshStarted = new Promise((resolve) => { started = resolve; });
  globalThis.fetch = async (url) => {
    if (!url.endsWith('/auth/refresh')) return response(401);
    started();
    await new Promise((resolve) => { release = resolve; });
    return response(200, { accessToken: 'late-access', refreshToken: 'late-refresh', user: { fullName: 'Old account' } });
  };
  const request = apiRequest('/students/me');
  await refreshStarted;
  session.clear();
  release();
  await assert.rejects(request, ApiError);
  assert.equal(session.getAccessToken(), null);
  assert.equal(session.getUser(), null);
});
test('a pending refresh cannot overwrite another account', async () => {
  let release;
  let started;
  const refreshStarted = new Promise((resolve) => { started = resolve; });
  globalThis.fetch = async (url) => {
    if (!url.endsWith('/auth/refresh')) return response(401);
    started();
    await new Promise((resolve) => { release = resolve; });
    return response(200, { accessToken: 'old-access', refreshToken: 'old-refresh' });
  };
  const request = apiRequest('/students/me');
  await refreshStarted;
  session.set({ accessToken: 'other-access', refreshToken: 'other-refresh' });
  release();
  await assert.rejects(request, ApiError);
  assert.equal(session.getAccessToken(), 'other-access');
});
test('public requests do not refresh or send authentication', async () => {
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls += 1;
    assert.equal(options.headers.Authorization, undefined);
    return response(401);
  };
  await assert.rejects(apiRequest('/auth/login', { auth: false }), ApiError);
  assert.equal(calls, 1);
});
test('failed refresh is shared and never retries protected calls indefinitely', async () => {
  let refreshCalls = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCalls += 1;
      await new Promise((resolve) => setImmediate(resolve));
    }
    return response(401);
  };
  const results = await Promise.allSettled([apiRequest('/students/me'), apiRequest('/notifications')]);
  assert.ok(results.every((result) => result.status === 'rejected'));
  assert.equal(refreshCalls, 1);
});
