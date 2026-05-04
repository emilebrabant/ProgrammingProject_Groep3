import {
    getActieveCompetenties,
    getEvaluatieVanStudent,
    createEvaluatie,
    getScoresVanEvaluatie,
    upsertStudentBeschrijving,
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