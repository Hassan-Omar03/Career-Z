import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../src/utils/detectLanguage.js';

test('the region of the device decides the language', () => {
  assert.equal(detectLanguage('Asia/Karachi', ['en-US']), 'ur');
  assert.equal(detectLanguage('Asia/Dubai', ['en-US']), 'ar');
  assert.equal(detectLanguage('Asia/Kolkata', []), 'hi');
  assert.equal(detectLanguage('Europe/Paris', ['en']), 'fr');
});
test('a region with no language of its own follows the browser, then English', () => {
  assert.equal(detectLanguage('Europe/London', ['en-GB']), 'en');
  assert.equal(detectLanguage('America/New_York', ['es-US', 'en']), 'es');
  assert.equal(detectLanguage('UTC', ['ja-JP']), 'en');
  assert.equal(detectLanguage('', []), 'en');
});
