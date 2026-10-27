import { describe, expect, it } from 'vitest';
import { normalizeBaseUrl } from '../src/api/config.js';
import { categoryLabel } from '../src/utils/category.js';
import { formatCurrency, formatSignedAmount } from '../src/utils/currency.js';
import { formatDate, formatMonthShort, parseISODate } from '../src/utils/date.js';
import { parseApiError } from '../src/utils/errors.js';
import { recordSchema, registerSchema } from '../src/utils/validation.js';

describe('formatting', () => {
  it('formats INR with Indian grouping', () => {
    expect(formatCurrency(1250000)).toBe('₹12,50,000.00');
    expect(formatCurrency(undefined)).toBe('₹0.00');
    expect(formatSignedAmount(500, 'expense')).toBe('−₹500.00');
    expect(formatSignedAmount(500, 'income')).toBe('+₹500.00');
  });
  it('labels categories', () => {
    expect(categoryLabel('food_dining')).toBe('Food & Dining');
    expect(categoryLabel('healthcare')).toBe('Healthcare');
  });
  it('parses API dates as local dates', () => {
    const d = parseISODate('2026-10-01');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 1]);
    expect(formatDate('2026-10-01')).toBe('01 Oct 2026');
    expect(formatMonthShort('2026-10')).toMatch(/Oct/);
  });
  it('normalises the base URL', () => {
    expect(normalizeBaseUrl(' http://localhost:8000/// ')).toBe('http://localhost:8000');
  });
});

describe('parseApiError', () => {
  it('reads string detail', () => {
    expect(parseApiError({ response: { status: 400, data: { detail: 'Username already taken' } } }).message).toBe('Username already taken');
  });
  it('maps 422 array detail to fields', () => {
    const e = parseApiError({ response: { status: 422, data: { detail: [{ loc: ['body', 'amount'], msg: 'must be > 0' }] } } });
    expect(e.fields.amount).toBe('must be > 0');
  });
  it('detects network failures', () => {
    expect(parseApiError({ request: {}, message: 'Network Error' }).kind).toBe('network');
  });
});

describe('schemas', () => {
  const ok = { amount: '10.50', type: 'income', category: 'salary', date: '2026-10-01', description: '' };
  it('accepts a valid record', () => { expect(recordSchema.safeParse(ok).success).toBe(true); });
  it('rejects zero amount, bad category, three decimals', () => {
    expect(recordSchema.safeParse({ ...ok, amount: '0' }).success).toBe(false);
    expect(recordSchema.safeParse({ ...ok, category: 'crypto' }).success).toBe(false);
    expect(recordSchema.safeParse({ ...ok, amount: '1.234' }).success).toBe(false);
  });
  it('checks password confirmation', () => {
    const base = { full_name: '', username: 'abc', email: 'a@b.co', password: 'secret1', confirm_password: 'secret2' };
    expect(registerSchema.safeParse(base).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, confirm_password: 'secret1' }).success).toBe(true);
  });
});
