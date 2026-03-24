import api from './axiosInstance';

export const getMice        = (params)    => api.get('/mouse', { params });
export const getMouse       = (id)        => api.get(`/mouse/${id}`);
export const createMouse    = (data)      => api.post('/mouse', data);
export const updateMouse    = (id, data)  => api.put(`/mouse/${id}`, data);
export const deleteMouse    = (id)        => api.delete(`/mouse/${id}`);
export const getMouseStats  = ()          => api.get('/mouse/meta/stats');
export const bulkImportMice = (items)     => api.post('/mouse/bulk', { mouse: items });
