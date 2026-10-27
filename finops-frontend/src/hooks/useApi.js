import { useCallback, useEffect, useRef, useState } from 'react';
import { parseApiError } from '../utils/errors.js';

/**
 * Runs `fetcher` whenever `deps` change. Ignores stale responses, keeps the previous data
 * visible while reloading, and exposes a normalised error plus `reload`.
 */
export function useApi(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const requestId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (id === requestId.current) setState({ data, error: null, loading: false });
    } catch (err) {
      if (id === requestId.current) setState((s) => ({ data: s.data, error: parseApiError(err), loading: false }));
    }
  }, deps);

  useEffect(() => {
    if (enabled) run();
    return () => { requestId.current += 1; };
  }, [run, enabled]);

  return { ...state, reload: run };
}
