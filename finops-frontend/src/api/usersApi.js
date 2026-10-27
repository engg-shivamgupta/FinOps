import client from './client.js';

export const usersApi = {
  me: () => client.get('/api/users/me').then((r) => r.data),
  list: () => client.get('/api/users/').then((r) => r.data),
  get: (id) => client.get(`/api/users/${id}`).then((r) => r.data),
  update: (id, payload) => client.patch(`/api/users/${id}`, payload).then((r) => r.data),
  deactivate: (id) => client.delete(`/api/users/${id}`).then(() => true),
};
