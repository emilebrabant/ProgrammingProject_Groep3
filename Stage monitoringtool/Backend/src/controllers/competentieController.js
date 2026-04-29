import {
    getAlleCompetenties,
    getCompetentieById,
    createCompetentie,
    updateCompetentie,
    heeftGekoppeldeScores,
    deleteCompetentie,
} from '../models/Competentie.js';


export const getAlle = async (req, res) => {
    try {
        const competenties = await getAlleCompetenties();
        return res.json({ competenties });
} catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

// nieuwe competentie aanmaken
export const maakAan = async (req, res) => {
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const naam = typeof req.body.naam === 'string' ? req.body.naam.trim() : '';
    const omschrijving = typeof req.body.omschrijving === 'string' ? req.body.omschrijving.trim() : '';
    const gewicht = Number(req.body.gewicht);

    if (!naam) {
        return res.status(400).json({ error: 'Naam is verplicht' });
    }

    if (isNaN(gewicht) || gewicht <= 0) {
        return res.status(400).json({ error: 'Gewicht moet een positief getal zijn' });
    }

    try {
        const id = await createCompetentie({ naam, omschrijving, gewicht });
        const competentie = await getCompetentieById(id);
        return res.status(201).json({ message: 'Competentie aangemaakt', competentie });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};

// Competentie bijwerken
export const update = async (req, res) => {
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    const naam = typeof req.body.naam === 'string' ? req.body.naam.trim() : '';
    const omschrijving = typeof req.body.omschrijving === 'string' ? req.body.omschrijving.trim() : '';
    const gewicht = Number(req.body.gewicht);

    if (!naam) {
        return res.status(400).json({ error: 'Naam is verplicht' });
    }

    if (isNaN(gewicht) || gewicht <= 0) {
        return res.status(400).json({ error: 'Gewicht moet een positief getal zijn' });
    }

    try {
        const bestaande = await getCompetentieById(req.params.id);
        if (!bestaande) {
            return res.status(404).json({ error: 'Competentie niet gevonden' });
        }

        await updateCompetentie({ id: req.params.id, naam, omschrijving, gewicht });
        const competentie = await getCompetentieById(req.params.id);
        return res.json({ message: 'Competentie bijgewerkt', competentie });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
}
};

// Competentie verwijderen
export const verwijder = async (req, res) => {
    if (req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Geen toegang' });
    }

    try {
        const bestaande = await getCompetentieById(req.params.id);
        if (!bestaande) {
            return res.status(404).json({ error: 'Competentie niet gevonden' });
        }

        // Controleer of er scores aan gekoppeld zijn
        const heeftScores = await heeftGekoppeldeScores(req.params.id);
        if (heeftScores) {
            return res.status(400).json({
                error: 'Deze competentie kan niet verwijderd worden omdat er al scores aan gekoppeld zijn',
            });
        }

        await deleteCompetentie(req.params.id);
        return res.json({ message: 'Competentie verwijderd' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Serverfout' });
    }
};