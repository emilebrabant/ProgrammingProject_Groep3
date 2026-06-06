//api routes met gebruik van de axios endpoint
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

//evaluatie ophalen als mentor
export const getMentorEvaluatie = async () => {
    const response = await axiosInstance.get('/evaluaties/mentor');
    return response.data;
};

//score en feedback opslaan
export const slaMentorScoreOp = async (competentie_id, mentor_score, mentor_feedback) => {
    const response = await axiosInstance.post('/evaluaties/mentor/score', {
        competentie_id,
        mentor_score,
        mentor_feedback,
    });
    return response.data;
};

//evaluatie indienen als mentor
export const dientEvaluatieIn = async () => {
    const response = await axiosInstance.patch('/evaluaties/mentor/indienen');
    return response.data;
};