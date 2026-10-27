import { parseApiError } from './errors.js';

/**
 * Applies a failed API call to a React Hook Form instance.
 * Field-level messages are attached when the field exists; everything else
 * is returned as a form-level message for an alert banner.
 */
export function applyApiError(error, setError, knownFields = []) {
  const parsed = parseApiError(error);
  let matched = false;
  for (const [field, msg] of Object.entries(parsed.fields)) {
    if (knownFields.includes(field)) {
      setError(field, { type: 'server', message: msg });
      matched = true;
    }
  }
  return matched && parsed.status === 422 ? 'Please fix the highlighted fields.' : parsed.message;
}
