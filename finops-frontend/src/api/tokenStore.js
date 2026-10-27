// Session lives in sessionStorage: it is scoped to the tab and cleared when the tab closes.
// Any script running on this origin can read it, so it is NOT XSS-proof (see README).
const KEY = 'finops.session';

export const tokenStore = {
  read() {
    try {
      const raw = sessionStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.token ? parsed : null;
    } catch {
      return null;
    }
  },
  getToken() {
    return this.read()?.token ?? null;
  },
  write(session) {
    try { sessionStorage.setItem(KEY, JSON.stringify(session)); } catch { /* storage unavailable */ }
  },
  clear() {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  },
};
