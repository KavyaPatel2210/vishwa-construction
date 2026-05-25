import api from './api';

export const invoiceService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v); });
    return api.get(`/invoices?${query.toString()}`);
  },
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  duplicate: (id) => api.post(`/invoices/${id}/duplicate`),
  markPaid: (id) => api.put(`/invoices/${id}`, { status: 'Paid' }),
  markPending: (id) => api.put(`/invoices/${id}`, { status: 'Pending' })
};
