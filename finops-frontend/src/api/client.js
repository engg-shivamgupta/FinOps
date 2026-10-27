import axios from 'axios';
import { API_BASE_URL } from './config.js';
import { tokenStore } from './tokenStore.js';

export { API_BASE_URL };

let sessionEndedHandler = null;
/** AuthContext registers a callback here; it is invoked with 'expired' or 'inactive'. */
export const onSessionEnded = (fn) => { sessionEndedHandler = fn; };

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = tokenStore.getToken();
  if (token && !config.skipAuth) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    // Only react when this request actually carried a token. Login/register use
    // skipAuth, so a wrong password (401) never triggers a "session expired" redirect.
    const carriedToken = Boolean(error.config && !error.config.skipAuth && tokenStore.getToken());
    if (carriedToken && sessionEndedHandler) {
      if (status === 401) sessionEndedHandler('expired');
      // A plain 403 means "no permission" and keeps the session. This exact backend
      // message (get_current_user) means the account was deactivated mid-session.
      else if (status === 403 && detail === 'User account is inactive') sessionEndedHandler('inactive');
    }
    return Promise.reject(error);
  },
);

export default client;
