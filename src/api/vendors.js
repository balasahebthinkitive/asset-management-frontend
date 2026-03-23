import api from './axiosInstance';

export const getVendors    = (params)     => api.get('/vendors', { params });
export const getVendor     = (id)         => api.get(`/vendors/${id}`);
export const createVendor  = (data)       => api.post('/vendors', data);
export const updateVendor  = (id, data)   => api.put(`/vendors/${id}`, data);
export const deleteVendor  = (id)         => api.delete(`/vendors/${id}`);
export const getVendorStats = ()          => api.get('/vendors/meta/stats');
