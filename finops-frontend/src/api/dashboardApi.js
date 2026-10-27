import client from './client.js';

export const dashboardApi = {
  summary: () => client.get('/api/dashboard/summary').then((r) => r.data),
  insights: () => client.get('/api/dashboard/insights').then((r) => r.data),
  roles: () => client.get('/api/dashboard/roles', { skipAuth: true }).then((r) => r.data),
  health: () => client.get('/', { skipAuth: true }).then((r) => r.data),
};
