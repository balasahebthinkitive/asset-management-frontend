

import api from './axiosInstance';

export const getInternLaptops      = (params)    => api.get('/intern-laptops', { params });
export const getInternLaptop       = (id)        => api.get(`/intern-laptops/${id}`);
export const createInternLaptop    = (data)      => api.post('/intern-laptops', data);
export const updateInternLaptop    = (id, data)  => api.put(`/intern-laptops/${id}`, data);
export const deleteInternLaptop    = (id)        => api.delete(`/intern-laptops/${id}`);
export const getInternLaptopStats  = ()          => api.get('/intern-laptops/meta/stats');
export const bulkImportInternLaptops = (items)   => api.post('/intern-laptops/bulk', { laptops: items });
