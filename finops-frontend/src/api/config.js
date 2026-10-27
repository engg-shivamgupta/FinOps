export function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000';
