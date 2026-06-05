import {
    getActieveCompetenties,
    getEvaluatieVanStudent,
    createEvaluatie,
    getScoresVanEvaluatie,
    upsertStudentBeschrijving,
    getEvaluatieVanMentor,
    upsertMentorScore,
    vergrendelEvaluatie,
} from '../models/Evaluatie.js';


import { getGevalideerdeStageVanStudent } from '../models/Stage.js';

// Student haalt evaluatie op met competenties 
export const getStudentEvaluatie = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {

        const stage = await getGevalideerdeStageVanStudent(req.session.user.id);
        if (!stage) {
            return res.status(400).json({
                error: 'Je kan pas evaluaties invullen wanneer je stageovereenkomst gevalideerd is.',
            });
        }

     
        const competenties = await getActieveCompetenties();

        let evaluatie = await getEvaluatieVanStudent(stage.id);
        if (!evaluatie) {
            const id = await createEvaluatie(stage.id, req.session.user.id);
            evaluatie = { id, stage_id: stage.id, vergrendeld: 0 };
        }

        const scores = await getScoresVanEvaluatie(evaluatie.id);

        return res.json({
            evaluatie,
            competenties,
            scores,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

//student slaat zelfevaluatie op per competentie
export const slaZelfevaluatieOp = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const competentie_id = Number(req.body.competentie_id);
    const student_beschrijving = typeof req.body.student_beschrijving === 'string'
        ? req.body.student_beschrijving.trim()
        : '';

    if (!competentie_id) {
        return res.status(400).json({ error: 'Competentie is verplicht' });
    }

    try {
        const stage = await getGevalideerdeStageVanStudent(req.session.user.id);
        if (!stage) {
            return res.status(400).json({
                error: 'Je kan pas evaluaties invullen wanneer je stageovereenkomst gevalideerd is.',
            });
        }

        let evaluatie = await getEvaluatieVanStudent(stage.id);
        if (!evaluatie) {
            const id = await createEvaluatie(stage.id, req.session.user.id);
            evaluatie = { id, stage_id: stage.id, vergrendeld: 0 }; 
    }


        if (evaluatie.vergrendeld) {
            return res.status(400).json({
                error: 'De evaluatie is afgesloten en kan niet meer bewerkt worden.', 
            });
        }

        await upsertStudentBeschrijving(evaluatie.id, competentie_id, student_beschrijving);

        return res.json({ message: 'Zelfevaluatie opgeslagen' });
     } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};


//evaluatie ophalen van zijn student
export const getMentorEvaluatie = async (req, res) => {
    if (req.session.user.rol !== 'mentor') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const evaluaties = await getEvaluatieVanMentor(req.session.user.naam);

        if (!evaluaties.length) {
            return res.status(404).json({ error: 'Geen evaluatie gevonden voor jouw studenten' });
        }

//neem de eerste evaluatie -->mentor heeft 1 student
        const evaluatie = evaluaties[0];
        const competenties = await getActieveCompetenties();
        const scores = await getScoresVanEvaluatie(evaluatie.id);

        return res.json({ evaluatie, competenties, scores });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

//mentor slaat score en feedback op per competentie
export const slaMentorScoreOp = async (req, res) => {
    if (req.session.user.rol !== 'mentor') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const competentie_id = Number(req.body.competentie_id);
    const mentor_score = Number(req.body.mentor_score);
    const mentor_feedback = typeof req.body.mentor_feedback === 'string'
        ? req.body.mentor_feedback.trim()
        : '';

    if (!competentie_id) {
        return res.status(400).json({ error: 'Competentie is verplicht' });
    }

    if (isNaN(mentor_score) || mentor_score < 0 || mentor_score > 20) {
        return res.status(400).json({ error: 'Score moet tussen 0 en 20 liggen' });
    }

    try {
        const evaluaties = await getEvaluatieVanMentor(req.session.user.naam);
        if (!evaluaties.length) {
            return res.status(404).json({ error: 'Geen evaluatie gevonden' });
        }

        const evaluatie = evaluaties[0];

        if (evaluatie.vergrendeld) {
            return res.status(400).json({ error: 'Deze evaluatie is al ingediend en kan niet meer bewerkt worden' });
        }

        await upsertMentorScore(evaluatie.id, competentie_id, mentor_score, mentor_feedback);
        return res.json({ message: 'Score opgeslagen' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

//mentor dient evaluatie in
export const dientEvaluatieIn = async (req, res) => {
    if (req.session.user.rol !== 'mentor') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const evaluaties = await getEvaluatieVanMentor(req.session.user.naam);
        if (!evaluaties.length) {
            return res.status(404).json({ error: 'Geen evaluatie gevonden' });
        }

        const evaluatie = evaluaties[0];

        if (evaluatie.vergrendeld) {
            return res.status(400).json({ error: 'Deze evaluatie is al ingediend' });
        }

        await vergrendelEvaluatie(evaluatie.id);
        return res.json({ message: 'Evaluatie succesvol ingediend' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};