import api from './axiosInstance';

export const getExtraEquipment      = (params)    => api.get('/extra-equipment', { params });
export const getExtraEquipmentById  = (id)        => api.get(`/extra-equipment/${id}`);
export const createExtraEquipment   = (data)      => api.post('/extra-equipment', data);
export const updateExtraEquipment   = (id, data)  => api.put(`/extra-equipment/${id}`, data);
export const deleteExtraEquipment   = (id)        => api.delete(`/extra-equipment/${id}`);
export const getExtraEquipmentStats = ()          => api.get('/extra-equipment/meta/stats');
export const bulkImportExtraEquipment = (items)   => api.post('/extra-equipment/bulk', { equipment: items });
