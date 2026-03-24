import api from './axiosInstance';

export const getClientDevices      = (params)    => api.get('/client-devices', { params });
export const getClientDevice       = (id)        => api.get(`/client-devices/${id}`);
export const createClientDevice    = (data)      => api.post('/client-devices', data);
export const updateClientDevice    = (id, data)  => api.put(`/client-devices/${id}`, data);
export const deleteClientDevice    = (id)        => api.delete(`/client-devices/${id}`);
export const getClientDeviceStats  = ()          => api.get('/client-devices/meta/stats');
export const bulkImportClientDevices = (items)   => api.post('/client-devices/bulk', { devices: items });
