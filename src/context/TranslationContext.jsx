import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { apiRequest } from '../api/client';

// Real, live machine translation (spec Part 16F "Smart Language Engine") — not a hardcoded
// per-language dictionary. There is no way to hand-write translation files for the entire app
// in every language the LanguageSelector offers, so instead this walks the rendered page's text
// nodes and translates them through the backend's /translate proxy (Google Cloud Translation
// API, client-provided key). Every string converts for real, for every language, with nothing
// pre-written — the trade-off is a real one worth knowing: because React still holds the
// original English string in its own virtual DOM, a re-render of a translated component can
// briefly flip that text back to English until the MutationObserver below notices and
// re-translates it (instantly, from cache, after the first time).
const TranslationContext = createContext(null);

const LANG_KEY = 'careerz_lang';
const CACHE_KEY = 'careerz_translation_cache_v1';
export const RTL_LANGS = ['ur', 'ar', 'fa', 'he'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'TITLE']);
const BATCH_SIZE = 100;
const DEBOUNCE_MS = 250;

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}
function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage full/unavailable — cache just won't persist across reloads */ }
}

export function TranslationProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'en');
  const [enabled, setEnabled] = useState(null); // null = still checking with the backend
  const [translating, setTranslating] = useState(false);

  const cacheRef = useRef(loadCache());
  const originalsRef = useRef(new WeakMap()); // DOM text node -> its original (English) text
  const justSetRef = useRef(new Set()); // nodes we just wrote ourselves, to ignore in the observer
  const observerRef = useRef(null);
  const pendingRef = useRef(new Set());
  const debounceTimer = useRef(null);
  const langRef = useRef(lang);

  useEffect(() => {
    apiRequest('/translate/config', { auth: false }).then((cfg) => setEnabled(cfg.enabled)).catch(() => setEnabled(false));
  }, []);

  const collectTextNodes = useCallback((root) => {
    if (root.nodeType === Node.TEXT_NODE) return root.nodeValue?.trim() ? [root] : [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest('[data-no-translate]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }, []);

  const translateNodes = useCallback(async (nodes, targetLang) => {
    if (!nodes || nodes.length === 0 || targetLang === 'en') return;
    const cache = cacheRef.current;
    const toFetchTexts = [];
    const toFetchNodes = [];

    nodes.forEach((node) => {
      if (!node.isConnected) return; // removed from the DOM since it was queued
      if (!originalsRef.current.has(node)) originalsRef.current.set(node, node.nodeValue);
      const original = originalsRef.current.get(node);
      if (!original || !original.trim()) return;
      const cacheKey = `${targetLang}::${original}`;
      if (cache[cacheKey]) {
        justSetRef.current.add(node);
        node.nodeValue = cache[cacheKey];
      } else {
        toFetchTexts.push(original);
        toFetchNodes.push(node);
      }
    });

    if (toFetchTexts.length === 0) return;

    // De-dupe identical strings in this batch — no point paying to translate "Save" 40 times.
    const unique = [...new Set(toFetchTexts)];
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const chunk = unique.slice(i, i + BATCH_SIZE);
      try {
        const { translations } = await apiRequest('/translate', { method: 'POST', auth: false, body: { texts: chunk, targetLang } });
        chunk.forEach((original, idx) => { cache[`${targetLang}::${original}`] = translations[idx]; });
      } catch (err) {
        console.warn('[translation] request failed, leaving those strings in English:', err.message);
      }
    }
    saveCache(cache);

    // An earlier language request must not overwrite a newer selection.
    if (langRef.current !== targetLang) return;
    toFetchNodes.forEach((node) => {
      if (!node.isConnected) return;
      const original = originalsRef.current.get(node);
      const translated = cache[`${targetLang}::${original}`];
      if (translated) {
        justSetRef.current.add(node);
        node.nodeValue = translated;
      }
    });
  }, []);

  const restoreOriginals = useCallback((root) => {
    collectTextNodes(root).forEach((node) => {
      if (originalsRef.current.has(node)) {
        justSetRef.current.add(node);
        node.nodeValue = originalsRef.current.get(node);
      }
    });
  }, [collectTextNodes]);

  const translatePage = useCallback(async (targetLang) => {
    if (targetLang === 'en') { restoreOriginals(document.body); setTranslating(false); return; }
    setTranslating(true);
    await translateNodes(collectTextNodes(document.body), targetLang);
    if (langRef.current === targetLang) setTranslating(false);
  }, [collectTextNodes, translateNodes, restoreOriginals]);

  const setLang = useCallback((code) => {
    langRef.current = code;
    setLangState(code);
    localStorage.setItem(LANG_KEY, code);
  }, []);

  useEffect(() => {
    langRef.current = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    // Scan after React commits the page; cancel a scheduled scan on a language change.
    const scanTimer = setTimeout(() => {
      if (enabled || lang === 'en') translatePage(lang);
    }, 0);
    return () => clearTimeout(scanTimer);
  }, [enabled, lang, translatePage]);

  // Re-converges newly-added or React-reverted text back to the active language. Debounced so a
  // burst of DOM changes (a panel loading its data, a route change) becomes one translate batch
  // instead of dozens of tiny ones.
  useEffect(() => {
    if (!enabled || lang === 'en') {
      if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null; }
      return;
    }

    function flush() {
      const nodes = [...pendingRef.current];
      pendingRef.current.clear();
      if (nodes.length > 0) translateNodes(nodes, langRef.current);
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'childList') {
          m.addedNodes.forEach((added) => collectTextNodes(added).forEach((n) => pendingRef.current.add(n)));
        } else if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
          const node = m.target;
          if (justSetRef.current.has(node)) { justSetRef.current.delete(node); return; } // that was us
          if (node.nodeValue?.trim()) pendingRef.current.add(node);
        }
      });
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(flush, DEBOUNCE_MS);
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    observerRef.current = observer;

    return () => { observer.disconnect(); clearTimeout(debounceTimer.current); };
  }, [enabled, lang, collectTextNodes, translateNodes]);

  return (
    <TranslationContext.Provider value={{ lang, setLang, enabled, translating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used within a TranslationProvider');
  return ctx;
}
