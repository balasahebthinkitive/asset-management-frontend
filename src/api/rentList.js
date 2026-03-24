import api from './axiosInstance';

export const getRentList      = (params)    => api.get('/rent-list', { params });
export const getRentItem      = (id)        => api.get(`/rent-list/${id}`);
export const createRentItem   = (data)      => api.post('/rent-list', data);
export const updateRentItem   = (id, data)  => api.put(`/rent-list/${id}`, data);
export const deleteRentItem   = (id)        => api.delete(`/rent-list/${id}`);
export const getRentListStats = ()          => api.get('/rent-list/meta/stats');
export const bulkImportRentList = (items)   => api.post('/rent-list/bulk', { rentList: items });
