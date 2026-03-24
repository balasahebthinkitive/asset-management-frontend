import api from './axiosInstance';

export const getMobiles     = (params)    => api.get('/mobiles', { params });
export const getMobile      = (id)        => api.get(`/mobiles/${id}`);
export const createMobile   = (data)      => api.post('/mobiles', data);
export const updateMobile   = (id, data)  => api.put(`/mobiles/${id}`, data);
export const deleteMobile   = (id)        => api.delete(`/mobiles/${id}`);
export const getMobileStats = ()          => api.get('/mobiles/meta/stats');
export const bulkImportMobiles = (items)  => api.post('/mobiles/bulk', { mobiles: items });
