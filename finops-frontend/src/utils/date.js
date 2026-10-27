// API dates are plain "YYYY-MM-DD" values. Parse them as *local* dates so
// they never shift a day because of time-zone conversion.
export function parseISODate(value) {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const dateFmt = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const monthShortFmt = new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' });
const monthLongFmt = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' });
const longFmt = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDate = (value) => {
  const d = parseISODate(value);
  return d ? dateFmt.format(d) : '—';
};

/** "2026-10" -> Date (first of month) */
const parseMonth = (key) => parseISODate(`${key}-01`);
export const formatMonthShort = (key) => { const d = parseMonth(key); return d ? monthShortFmt.format(d) : String(key); };
export const formatMonthLong = (key) => { const d = parseMonth(key); return d ? monthLongFmt.format(d) : String(key); };
export const formatLongDate = (d = new Date()) => longFmt.format(d);

export const toISODate = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
export const todayISO = () => toISODate(new Date());
