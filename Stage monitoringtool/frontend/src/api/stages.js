
// Alle API calls naar de backend voor stagevoorstellen
import axiosInstance from './axios.js';

// docenten lijst voor de dropdown in het formulier
export const getDocenten = async () => {
    const response = await axiosInstance.get('/stages/docenten');
    return response.data;
};

//nieuw stagevoorstel indienen
export const stageIndienen = async (data) => {
    const response = await axiosInstance.post('/stages', data);
    return response.data;
};

export const stageAanpassen = async (id, data) => {
    const response = await axiosInstance.patch(`/stages/${id}`, data);
    return response.data;
};


//stages ophalen als student
export const getMijnStages = async () => {
    const response = await axiosInstance.get('/stages/mijn');
    return response.data;};


// Alle stages ophalen als commissielid (gefilterd op status)
export const getAlleStages = async (status) => {
    const params = status ? { status } : {};
    const response = await axiosInstance.get('/stages', { params });
    return response.data;
};

// 1 stage ophalen op ID (voor StageDetail.jsx)
export const getStageById = async (id) => {
    const response = await axiosInstance.get(`/stages/${id}`);
    return response.data;
};

export const getStageHistoriek = async (id) => {
    const response = await axiosInstance.get(`/stages/${id}/historiek`);
    return response.data;
};

export const verwerkStageBeslissing = async (id, data) => {
    const response = await axiosInstance.patch(`/stages/${id}/beslissing`, data);
    return response.data;
};
