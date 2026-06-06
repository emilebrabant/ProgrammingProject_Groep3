//api route voor communicatie met backend
import axiosInstance from './axios.js';

//krijg studentendata
export const getStudentOverzicht = async () => {
  const response = await axiosInstance.get('/dashboard/student');
  return response.data;
};

//krijg logboeken van een bepaalde student
export const getStudentLogboeken = async () => {
  const response = await axiosInstance.get('/stages/logboeken/mijn');
  return response.data;
};

//maak een logboek
export const createStudentLogboek = async (payload) => {
  const response = await axiosInstance.post('/stages/logboeken', payload);
  return response.data;
};

//krijg feedback op logboek
export const getLogboekFeedback = async (logboekId) => {
    const response = await axiosInstance.get(`/stages/logboeken/${logboekId}/feedback`);
    return response.data;
};