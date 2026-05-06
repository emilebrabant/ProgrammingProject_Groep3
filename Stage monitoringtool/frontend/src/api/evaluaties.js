import axiosInstance from './axios.js';

//zelfevaluatie ophalen als student
export const getStudentEvaluatie = async () => {
    const response = await axiosInstance.get('/evaluaties/student');
    return response.data;
};

//zelfevaluatie opslaan per competentie
export const slaZelfevaluatieOp = async (competentie_id, student_beschrijving) => {
    const response = await axiosInstance.post('/evaluaties/student/zelfevaluatie', {
        competentie_id,
        student_beschrijving,
    });
    return response.data;
}; 