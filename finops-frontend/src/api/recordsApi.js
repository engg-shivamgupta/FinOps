import client from './client.js';

// Collection routes keep their trailing slash: FastAPI answers "/api/records" with a
// 307 redirect, and browsers cannot follow redirects on cross-origin CORS preflights.
const clean = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const recordsApi = {
  list: (params = {}) => client.get('/api/records/', { params: clean(params) }).then((r) => r.data),
  get: (id) => client.get(`/api/records/${id}`).then((r) => r.data),
  create: (payload) => client.post('/api/records/', payload).then((r) => r.data),
  update: (id, payload) => client.put(`/api/records/${id}`, payload).then((r) => r.data),
  remove: (id) => client.delete(`/api/records/${id}`).then(() => true),
};
