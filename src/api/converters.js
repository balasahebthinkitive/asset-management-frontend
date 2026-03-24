import api from './axiosInstance';

export const getConverters      = (params)    => api.get('/converters', { params });
export const getConverter       = (id)        => api.get(`/converters/${id}`);
export const createConverter    = (data)      => api.post('/converters', data);
export const updateConverter    = (id, data)  => api.put(`/converters/${id}`, data);
export const deleteConverter    = (id)        => api.delete(`/converters/${id}`);
export const getConverterStats  = ()          => api.get('/converters/meta/stats');
export const bulkImportConverters = (items)   => api.post('/converters/bulk', { converters: items });
