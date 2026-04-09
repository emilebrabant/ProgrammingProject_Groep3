
// Verwerkt alle aanvragen rond stagevoorstellen

import {
    createStage,
    getActiefVoorstelVanStudent,
    getStagesVanStudent,
    getAlleStages,
    getDocenten,
    addHistoriek,
} from '../models/Stage.js';

import { createStage, getActiefVoorstelVanStudent, getStagesVanStudent, getAlleStages, getDocenten, addHistoriek, getStageById } from '../models/Stage.js';

// student dient een nieuw voorstel in
export const indienen = async (req, res) => {
    
// Enkel studenten mogen een voorstel indienen
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

        const { docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum } = req.body;



// verplichte velden controleren
    if (!bedrijf_naam || !bedrijf_adres || !contactpersoon || !opdracht || !start_datum || !eind_datum || !docent_id) {
        return res.status(400).json({ error: 'Alle verplichte velden moeten ingevuld zijn' });
    }

    try {
        // Controleer of student al voorstel heeft (dat actief is)
        const bestaandVoorstel = await getActiefVoorstelVanStudent(req.session.user.id);
        if (bestaandVoorstel) {
            return res.status(400).json({ error: 'Je hebt al een actief stagevoorstel. Je kan maar 1 actief voorstel tegelijk hebben.' });
        }

        // Stage aanmaken
        const newId = await createStage({
            student_id: req.session.user.id,
            docent_id,
            bedrijf_naam,
            bedrijf_adres,
            contactpersoon,
            opdracht,
            start_datum,
            eind_datum,
 });

    //geschiedenis bijhoude
        await addHistoriek({
            stage_id: newId,
            status: 'Ingediend',
            feedback: null,
            gewijzigd_door: req.session.user.id,
        });

        return res.status(201).json({ message: 'Stagevoorstel ingediend', id: newId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};


//student ziet eigen voorstellen
export const getMijnStages = async (req, res) => {
    if (req.session.user.rol !== 'student') {
           return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const stages = await getStagesVanStudent(req.session.user.id);
        return res.json({ stages });
 } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
      }
};

//commissie ziet allevoorstellen

export const getAlle = async (req, res) => {
    if (req.session.user.rol !== 'commissie' && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const { status } = req.query;
        const stages = await getAlleStages(status || null);
        return res.json({ stages });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

//lijst van docenten voor dropdown
export const getDocentenLijst = async (req, res) => {
    try {
        const docenten = await getDocenten();
        return res.json({ docenten });
 } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};


// één stage ophalen op ID (voor StageDetail.jsx)
export const getEen = async (req, res) => {
    if (req.session.user.rol !== 'commissie' && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const stage = await getStageById(req.params.id);
        if (!stage) return res.status(404).json({ error: 'Voorstel niet gevonden' });
        return res.json({ stage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};