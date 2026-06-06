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

//aanpassen van een stage
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

//krijg historiek van 1bepaalde stage
export const getStageHistoriek = async (id) => {
    const response = await axiosInstance.get(`/stages/${id}/historiek`);
    return response.data;
};

//updaten van stage verificatie
export const verwerkStageBeslissing = async (id, data) => {
    const response = await axiosInstance.patch(`/stages/${id}/beslissing`, data);
    return response.data;
};

//uploaden van een stagebestand
export const uploadStageOvereenkomst = async (id, file) => {
    const formData = new FormData();
    formData.append('bestand', file);
    const response = await axiosInstance.post(`/stages/${id}/overeenkomst`, formData);
    return response.data;
};

//krijg het stagebestand van een bepaalde stage
export const getStageOvereenkomstUrl = (id) => {
    return `${axiosInstance.defaults.baseURL}/stages/${id}/overeenkomst`;
};

//valideren van stagebestand
export const valideerStageOvereenkomst = async (id, data) => {
    const response = await axiosInstance.patch(`/stages/${id}/overeenkomst/validatie`, data);
    return response.data;
};


//logboeken ophalen als mentor
export const getMentorLogboeken = async () => {
    const response = await axiosInstance.get('/stages/logboeken/mentor');
    return response.data;
};

// Logboek aftekenen als mentor met commentaar
export const aftekenenLogboek = async (logboekId, commentaar = '') => {
    const response = await axiosInstance.patch(
        `/stages/logboeken/${logboekId}/aftekenen`,
        { commentaar }
    );
    return response.data;
};


// logboeken ophalen als docent
export const getDocentLogboeken = async () => {
    const response = await axiosInstance.get('/stages/logboeken/docent');
    return response.data;
};

//fedback toevoegen aan een logboek als docent
export const voegFeedbackToe = async (logboekId, tekst) => {
    const response = await axiosInstance.post(
        `/stages/logboeken/${logboekId}/feedback`,
        { tekst }
    );
    return response.data;
};