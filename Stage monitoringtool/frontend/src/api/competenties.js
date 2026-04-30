
import axiosInstance from './axios.js';


export const getAlleCompetenties = async () => {
    const response = await axiosInstance.get('/competenties');
    return response.data;
};

export const createCompetentie = async (data) => {
    const response = await axiosInstance.post('/competenties', data);
    return response.data;
};


export const updateCompetentie = async (id, data) => {
    const response = await axiosInstance.patch(`/competenties/${id}`, data);
    return response.data;
};

export const deleteCompetentie = async (id) => {
    const response = await axiosInstance.delete(`/competenties/${id}`);
    return response.data;
};