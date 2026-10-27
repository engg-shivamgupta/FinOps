import { API_BASE_URL } from '../api/config.js';

/**
 * Normalises any Axios/FastAPI failure into { status, kind, message, fields }.
 * - detail as string  -> message
 * - detail as array   -> per-field messages (422 validation errors)
 * - no response       -> network / timeout
 */
export function parseApiError(error) {
  if (!error?.response) {
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return { status: 0, kind: 'timeout', fields: {}, message: 'The request timed out. Check your connection and try again.' };
    }
    if (error?.request) {
      return {
        status: 0, kind: 'network', fields: {},
        message: `Can't reach the FinOps API at ${API_BASE_URL}. Make sure the backend is running and that its CORS settings allow this origin.`,
      };
    }
    return { status: 0, kind: 'client', fields: {}, message: error?.message || 'Something went wrong.' };
  }

  const { status, data } = error.response;
  const detail = data?.detail;
  const fields = {};
  let message = '';

  if (typeof detail === 'string') {
    message = detail;
  } else if (Array.isArray(detail)) {
    for (const item of detail) {
      const loc = Array.isArray(item?.loc) ? item.loc.filter((p) => p !== 'body') : [];
      const key = String(loc[loc.length - 1] ?? 'form');
      if (!fields[key]) fields[key] = item?.msg || 'Invalid value';
    }
    message = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('; ') || 'Some fields are invalid.';
  }

  if (!message) {
    if (status === 401) message = 'Your session is no longer valid. Please sign in again.';
    else if (status === 403) message = "You don't have permission to do that.";
    else if (status === 404) message = 'The requested item was not found.';
    else if (status >= 500) message = 'The server ran into a problem. Try again in a moment.';
    else message = `Request failed (HTTP ${status}).`;
  } else if (status >= 500) {
    message = 'The server ran into a problem. Try again in a moment.';
  }

  return { status, kind: 'http', message, fields };
}
