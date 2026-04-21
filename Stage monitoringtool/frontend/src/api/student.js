import axiosInstance from './axios.js';

export const getStudentOverzicht = async () => {
  const response = await axiosInstance.get('/dashboard/student');
  return response.data;
};
