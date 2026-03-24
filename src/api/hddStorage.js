import api from './axiosInstance';

export const getHDDs       = (params)    => api.get('/hdd-storage', { params });
export const getHDD        = (id)        => api.get(`/hdd-storage/${id}`);
export const createHDD     = (data)      => api.post('/hdd-storage', data);
export const updateHDD     = (id, data)  => api.put(`/hdd-storage/${id}`, data);
export const deleteHDD     = (id)        => api.delete(`/hdd-storage/${id}`);
export const getHDDStats   = ()          => api.get('/hdd-storage/meta/stats');
export const bulkImportHDDs = (items)    => api.post('/hdd-storage/bulk', { hdds: items });
