import axiosInstance from './axios.js';

export const getStudentOverzicht = async () => {
  const response = await axiosInstance.get('/dashboard/student');
  return response.data;
};

export const getStudentLogboeken = async () => {
  const response = await axiosInstance.get('/stages/logboeken/mijn');
  return response.data;
};

export const createStudentLogboek = async (payload) => {
  const response = await axiosInstance.post('/stages/logboeken', payload);
  return response.data;
};
