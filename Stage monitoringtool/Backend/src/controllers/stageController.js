
// Verwerkt alle aanvragen rond stagevoorstellen

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import {
    createStage,
    getActiefVoorstelVanStudent,
    getStagesVanStudent,
    getAlleStages,
    getDocenten,
    addHistoriek,
    getStageById,
    getStageHistoriek,
    updateStageStatus,
    updateStageVoorstel,
    getOvereenkomstByStageId,
    upsertOvereenkomst,
    updateOvereenkomstValidatie,
    getLogboekenVanStudent,
    getGevalideerdeStageVanStudent,
    getLogboekVoorStageEnWeek,
    createLogboek,
} from '../models/Stage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const overeenkomstUploadDir = path.join(projectRoot, 'uploads', 'overeenkomsten');

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

export const getHistoriek = async (req, res) => {
    if (req.session.user.rol !== 'commissie' && req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const stage = await getStageById(req.params.id);
        if (!stage) {
            return res.status(404).json({ error: 'Voorstel niet gevonden' });
        }

        const historiek = await getStageHistoriek(req.params.id);
        return res.json({ historiek });
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

export const uploadOvereenkomst = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Selecteer een PDF-bestand om te uploaden' });
    }

    try {
        const stage = await getStageById(req.params.id);
        if (!stage) {
            return res.status(404).json({ error: 'Voorstel niet gevonden' });
        }

        if (stage.student_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Geen toegang' });
        }

        if (stage.status !== 'goedgekeurd') {
            return res.status(400).json({ error: 'Upload is enkel mogelijk voor goedgekeurde stagevoorstellen' });
        }

        const bestaandeOvereenkomst = await getOvereenkomstByStageId(stage.id);
        if (bestaandeOvereenkomst?.status === 'geupload' || bestaandeOvereenkomst?.status === 'gevalideerd') {
            return res.status(400).json({
                error: 'De overeenkomst is al geüpload en kan pas opnieuw worden aangepast na een afkeuring.',
            });
        }

        await fs.mkdir(overeenkomstUploadDir, { recursive: true });

        if (bestaandeOvereenkomst?.bestand_pad) {
            const oudBestand = path.resolve(projectRoot, bestaandeOvereenkomst.bestand_pad);
            await fs.unlink(oudBestand).catch(() => undefined);
        }

        const bestandsnaam = `stage-${stage.id}-student-${req.session.user.id}-${Date.now()}.pdf`;
        const absolutePad = path.join(overeenkomstUploadDir, bestandsnaam);
        const relatiefPad = path.join('uploads', 'overeenkomsten', bestandsnaam);

        await fs.writeFile(absolutePad, req.file.buffer);
        await upsertOvereenkomst({
            stage_id: stage.id,
            bestand_pad: relatiefPad,
        });

        return res.status(201).json({
            message: 'PDF succesvol geupload',
            overeenkomstStatus: 'geupload',
            overeenkomstStatusLabel: 'Geüpload, wachtend op validatie',
            downloadUrl: `/api/stages/${stage.id}/overeenkomst`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

export const downloadOvereenkomst = async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Niet ingelogd' });
    }

    try {
        const stage = await getStageById(req.params.id);
        if (!stage) {
            return res.status(404).json({ error: 'Voorstel niet gevonden' });
        }

        const rol = req.session.user.rol;
        const isStudentEigenBestand = rol === 'student' && stage.student_id === req.session.user.id;
        const isAdminOfCommissie = rol === 'admin' || rol === 'commissie';

        if (!isStudentEigenBestand && !isAdminOfCommissie) {
            return res.status(403).json({ error: 'Geen toegang' });
        }

        const overeenkomst = await getOvereenkomstByStageId(stage.id);
        if (!overeenkomst?.bestand_pad) {
            return res.status(404).json({ error: 'Geen overeenkomst beschikbaar' });
        }

        const absolutePad = path.resolve(projectRoot, overeenkomst.bestand_pad);
        const downloadNaam = `stageovereenkomst-${stage.id}.pdf`;
        return res.download(absolutePad, downloadNaam);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

export const valideerOvereenkomst = async (req, res) => {
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const { actie, reden } = req.body;
    const actieNaarStatus = {
        gevalideren: 'gevalideerd',
        valideren: 'gevalideerd',
        goedkeuren: 'gevalideerd',
        afkeuren: 'afgekeurd',
    };

    const status = actieNaarStatus[actie];
    if (!status) {
        return res.status(400).json({ error: 'Ongeldige actie' });
    }

    const redenTekst = typeof reden === 'string' ? reden.trim() : '';
    if (status === 'afgekeurd' && !redenTekst) {
        return res.status(400).json({ error: 'Een reden is verplicht bij afkeuren' });
    }

    try {
        const stage = await getStageById(req.params.id);
        if (!stage) {
            return res.status(404).json({ error: 'Voorstel niet gevonden' });
        }

        const overeenkomst = await getOvereenkomstByStageId(stage.id);
        if (!overeenkomst?.bestand_pad) {
            return res.status(400).json({ error: 'Er is nog geen geuploade overeenkomst om te valideren' });
        }

        if (overeenkomst.status !== 'geupload') {
            return res.status(400).json({
                error: 'Deze overeenkomst is al beoordeeld. Wacht tot de student een nieuwe versie uploadt.',
            });
        }

        await updateOvereenkomstValidatie({
            stage_id: stage.id,
            status,
            gevalideerd_door: req.session.user.id,
        });

        const historiekStatus = status === 'gevalideerd' ? 'overeenkomst_gevalideerd' : 'overeenkomst_afgekeurd';
        await addHistoriek({
            stage_id: stage.id,
            status: historiekStatus,
            feedback: status === 'afgekeurd' ? redenTekst : 'Overeenkomst gevalideerd door admin',
            gewijzigd_door: req.session.user.id,
        });

        const geupdateStage = await getStageById(stage.id);
        return res.json({
            message: status === 'gevalideerd'
                ? 'Overeenkomst werd gevalideerd'
                : 'Overeenkomst werd afgekeurd',
            stage: geupdateStage,
            overeenkomstStatus: status,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

export const getMijnLogboeken = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const logboeken = await getLogboekenVanStudent(req.session.user.id);
        return res.json({ logboeken });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

export const maakLogboek = async (req, res) => {
    if (req.session.user.rol !== 'student') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const weeknummer = Number(req.body.weeknummer);
    const taken = typeof req.body.taken === 'string' ? req.body.taken.trim() : '';
    const reflectie = typeof req.body.reflectie === 'string' ? req.body.reflectie.trim() : '';
    const leerpunten = typeof req.body.leerpunten === 'string' ? req.body.leerpunten.trim() : '';

    if (!Number.isInteger(weeknummer) || weeknummer < 1 || weeknummer > 53) {
        return res.status(400).json({ error: 'Weeknummer moet een geheel getal zijn tussen 1 en 53' });
    }

    if (!taken || !reflectie) {
        return res.status(400).json({ error: 'Taken en reflectie zijn verplicht' });
    }

    try {
        const stage = await getGevalideerdeStageVanStudent(req.session.user.id);
        if (!stage) {
            return res.status(400).json({
                error: 'Je kan pas logboeken invullen wanneer je stageovereenkomst gevalideerd is.',
            });
        }

        const bestaandLogboek = await getLogboekVoorStageEnWeek(stage.id, weeknummer);
        if (bestaandLogboek) {
            return res.status(409).json({
                error: `Voor week ${weeknummer} bestaat al een logboek.`,
            });
        }

        const logboekId = await createLogboek({
            stage_id: stage.id,
            weeknummer,
            taken,
            reflectie,
            leerpunten,
        });

        return res.status(201).json({
            message: 'Logboek opgeslagen',
            logboek: {
                id: logboekId,
                stage_id: stage.id,
                weeknummer,
                taken,
                reflectie,
                leerpunten,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};