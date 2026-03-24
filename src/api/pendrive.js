import api from './axiosInstance';

export const getPendrives      = (params)    => api.get('/pendrive', { params });
export const getPendrive       = (id)        => api.get(`/pendrive/${id}`);
export const createPendrive    = (data)      => api.post('/pendrive', data);
export const updatePendrive    = (id, data)  => api.put(`/pendrive/${id}`, data);
export const deletePendrive    = (id)        => api.delete(`/pendrive/${id}`);
export const getPendriveStats  = ()          => api.get('/pendrive/meta/stats');
export const bulkImportPendrives = (items)   => api.post('/pendrive/bulk', { pendrives: items });
