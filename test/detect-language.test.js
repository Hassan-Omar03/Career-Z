import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../src/utils/detectLanguage.js';

const SUPPORTED = ['en', 'ur', 'ar', 'fr'];
test('the language chosen in the browser decides, wherever the visitor is', () => {
  assert.equal(detectLanguage(['en-US', 'ar'], SUPPORTED), 'en');
  assert.equal(detectLanguage(['ar-SA', 'en'], SUPPORTED), 'ar');
  assert.equal(detectLanguage(['ur-PK'], SUPPORTED), 'ur');
  assert.equal(detectLanguage(['fr-FR', 'en'], SUPPORTED), 'fr');
});
test('a browser language the site cannot translate into falls to the next one, then English', () => {
  assert.equal(detectLanguage(['ja-JP', 'ar'], SUPPORTED), 'ar');
  assert.equal(detectLanguage(['ja-JP'], SUPPORTED), 'en');
  assert.equal(detectLanguage([], SUPPORTED), 'en');
});
