import api from './axiosInstance';

export const getTickets    = (params)     => api.get('/tickets', { params });
export const getTicket     = (id)         => api.get(`/tickets/${id}`);
export const createTicket  = (data)       => api.post('/tickets', data);
export const updateTicket  = (id, data)   => api.put(`/tickets/${id}`, data);
export const deleteTicket  = (id)         => api.delete(`/tickets/${id}`);
export const getTicketStats = ()          => api.get('/tickets/meta/stats');
