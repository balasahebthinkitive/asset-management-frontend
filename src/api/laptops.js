import api from './axiosInstance';

export const getLaptops      = (params)     => api.get('/laptops', { params });
export const getLaptop       = (id)         => api.get(`/laptops/${id}`);
export const createLaptop    = (data)       => api.post('/laptops', data);
export const updateLaptop    = (id, data)   => api.put(`/laptops/${id}`, data);
export const deleteLaptop    = (id)         => api.delete(`/laptops/${id}`);
export const getLaptopStats  = ()           => api.get('/laptops/meta/stats');
export const bulkImportLaptops = (laptops)  => api.post('/laptops/bulk', { laptops });
