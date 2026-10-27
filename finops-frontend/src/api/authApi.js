import client from './client.js';

export const authApi = {
  login: (username, password) =>
    client.post('/api/auth/login', { username, password }, { skipAuth: true }).then((r) => r.data),
  register: (payload) =>
    client.post('/api/auth/register', payload, { skipAuth: true }).then((r) => r.data),
};
