//api route in frontend met gebruik van axios
import axiosInstance from './axios.js';

//krijg alle competenties
export const getAlleCompetenties = async () => {
    const response = await axiosInstance.get('/competenties');
    return response.data;
};

//maak een competentie
export const createCompetentie = async (data) => {
    const response = await axiosInstance.post('/competenties', data);
    return response.data;
};

//update een competentie
export const updateCompetentie = async (id, data) => {
    const response = await axiosInstance.patch(`/competenties/${id}`, data);
    return response.data;
};

//delete een competentie
export const deleteCompetentie = async (id) => {
    const response = await axiosInstance.delete(`/competenties/${id}`);
    return response.data;
};