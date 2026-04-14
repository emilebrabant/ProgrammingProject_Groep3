
// Verwerkt alle aanvragen rond stagevoorstellen



import { createStage, getActiefVoorstelVanStudent, getStagesVanStudent, getAlleStages, getDocenten, addHistoriek, getStageById, updateStageStatus, updateStageVoorstel } from '../models/Stage.js';

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
            status: 'ingediend',
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

export const verwerkBeslissing = async (req, res) => {
    if (req.session.user.rol !== 'commissie' && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const { actie, feedback } = req.body;
    const actieNaarStatus = {
        goedkeuren: 'goedgekeurd',
        goedgekeuren: 'goedgekeurd',
        afkeuren: 'afgekeurd',
        aanpassing_vereist: 'aanpassing_vereist',
        'aanpassing vereist': 'aanpassing_vereist',
    };

    const status = actieNaarStatus[actie];
    if (!status) {
        return res.status(400).json({ error: 'Ongeldige actie' });
    }

    const feedbackTekst = typeof feedback === 'string' ? feedback.trim() : '';
    if ((status === 'afgekeurd' || status === 'aanpassing_vereist') && !feedbackTekst) {
        return res.status(400).json({ error: 'Feedback is verplicht bij afkeuren of aanpassing vereist' });
    }

    try {
        const bestaandeStage = await getStageById(req.params.id);
        if (!bestaandeStage) {
            return res.status(404).json({ error: 'Voorstel niet gevonden' });
        }

        if (bestaandeStage.status === 'goedgekeurd' || bestaandeStage.status === 'afgekeurd') {
            return res.status(400).json({ error: 'De status van een goedgekeurd of afgekeurd voorstel kan niet meer aangepast worden' });
        }

        await updateStageStatus({
            stage_id: req.params.id,
            status,
        });

        await addHistoriek({
            stage_id: req.params.id,
            status,
            feedback: feedbackTekst || null,
            gewijzigd_door: req.session.user.id,
        });

        const stage = await getStageById(req.params.id);
        return res.json({ message: 'Voorstelstatus bijgewerkt', stage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

export const updateMijnStage = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const bestaandeStage = await getStageById(req.params.id);
    if (!bestaandeStage) {
        return res.status(404).json({ error: 'Voorstel niet gevonden' });
    }

    if (bestaandeStage.student_id !== req.session.user.id) {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    if (bestaandeStage.status !== 'aanpassing_vereist') {
        return res.status(400).json({ error: 'Aanpassen is alleen mogelijk wanneer de status aanpassing vereist is' });
    }

    const { docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum } = req.body;

    if (!bedrijf_naam || !bedrijf_adres || !contactpersoon || !opdracht || !start_datum || !eind_datum || !docent_id) {
        return res.status(400).json({ error: 'Alle verplichte velden moeten ingevuld zijn' });
    }

    try {
        await updateStageVoorstel({
            stage_id: req.params.id,
            docent_id,
            bedrijf_naam,
            bedrijf_adres,
            contactpersoon,
            opdracht,
            start_datum,
            eind_datum,
        });

        await addHistoriek({
            stage_id: req.params.id,
            status: 'ingediend',
            feedback: null,
            gewijzigd_door: req.session.user.id,
        });

        const stage = await getStageById(req.params.id);
        return res.json({ message: 'Stagevoorstel opnieuw ingediend', stage });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};