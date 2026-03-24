import api from './axiosInstance';

export const getPeople      = (params)    => api.get('/people', { params });
export const getPerson      = (id)        => api.get(`/people/${id}`);
export const createPerson   = (data)      => api.post('/people', data);
export const updatePerson   = (id, data)  => api.put(`/people/${id}`, data);
export const deletePerson   = (id)        => api.delete(`/people/${id}`);
export const getPeopleStats = ()          => api.get('/people/meta/stats');
