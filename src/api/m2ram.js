import api from './axiosInstance';

export const getM2RAMs       = (params)    => api.get('/m2-ram', { params });
export const getM2RAM        = (id)        => api.get(`/m2-ram/${id}`);
export const createM2RAM     = (data)      => api.post('/m2-ram', data);
export const updateM2RAM     = (id, data)  => api.put(`/m2-ram/${id}`, data);
export const deleteM2RAM     = (id)        => api.delete(`/m2-ram/${id}`);
export const getM2RAMStats   = ()          => api.get('/m2-ram/meta/stats');
export const bulkImportM2RAM = (items)     => api.post('/m2-ram/bulk', { m2ram: items });
