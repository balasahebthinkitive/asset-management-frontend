import api from './axiosInstance';

export const getKeyboards      = (params)    => api.get('/keyboard', { params });
export const getKeyboard       = (id)        => api.get(`/keyboard/${id}`);
export const createKeyboard    = (data)      => api.post('/keyboard', data);
export const updateKeyboard    = (id, data)  => api.put(`/keyboard/${id}`, data);
export const deleteKeyboard    = (id)        => api.delete(`/keyboard/${id}`);
export const getKeyboardStats  = ()          => api.get('/keyboard/meta/stats');
export const bulkImportKeyboards = (items)   => api.post('/keyboard/bulk', { keyboards: items });
