import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// A tab that lives in the address, like useState for its value: refresh keeps it open, and the
// browser's back and forward buttons walk through the tabs one step at a time.
export default function useUrlTab(param, initial, allowed = null) {
  const location = useLocation();
  const navigate = useNavigate();
  const fromUrl = new URLSearchParams(location.search).get(param);
  const value = fromUrl && (!allowed || allowed.includes(fromUrl)) ? fromUrl : initial;
  const setValue = useCallback((next) => {
    const resolved = typeof next === 'function' ? next(value) : next;
    if (resolved === value) return;
    const query = new URLSearchParams(window.location.search);
    query.set(param, resolved);
    navigate({ pathname: window.location.pathname, search: `?${query}` });
  }, [param, value, navigate]);
  return [value, setValue];
}
