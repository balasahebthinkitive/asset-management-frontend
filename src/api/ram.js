import api from './axiosInstance';

export const getRAMs       = (params)    => api.get('/ram', { params });
export const getRAM        = (id)        => api.get(`/ram/${id}`);
export const createRAM     = (data)      => api.post('/ram', data);
export const updateRAM     = (id, data)  => api.put(`/ram/${id}`, data);
export const deleteRAM     = (id)        => api.delete(`/ram/${id}`);
export const getRAMStats   = ()          => api.get('/ram/meta/stats');
export const bulkImportRAM = (items)     => api.post('/ram/bulk', { ram: items });
