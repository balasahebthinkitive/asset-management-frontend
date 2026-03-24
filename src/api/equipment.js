import api from './axiosInstance';

export const getEquipment      = (params)    => api.get('/equipment', { params });
export const getEquipmentById  = (id)        => api.get(`/equipment/${id}`);
export const createEquipment   = (data)      => api.post('/equipment', data);
export const updateEquipment   = (id, data)  => api.put(`/equipment/${id}`, data);
export const deleteEquipment   = (id)        => api.delete(`/equipment/${id}`);
export const getEquipmentStats = ()          => api.get('/equipment/meta/stats');
export const bulkImportEquipment = (items)   => api.post('/equipment/bulk', { equipment: items });
