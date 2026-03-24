import api from './axiosInstance';

export const getMonitors      = (params)    => api.get('/monitors', { params });
export const getMonitor       = (id)        => api.get(`/monitors/${id}`);
export const createMonitor    = (data)      => api.post('/monitors', data);
export const updateMonitor    = (id, data)  => api.put(`/monitors/${id}`, data);
export const deleteMonitor    = (id)        => api.delete(`/monitors/${id}`);
export const getMonitorStats  = ()          => api.get('/monitors/meta/stats');
export const bulkImportMonitors = (items)   => api.post('/monitors/bulk', { monitors: items });
