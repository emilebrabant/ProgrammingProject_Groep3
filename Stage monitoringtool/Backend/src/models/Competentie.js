
import pool from '../config/db.js';

//competenties ophalen
export const getAlleCompetenties = async () => {
    const [rows] = await pool.query(
        `SELECT id, naam, omschrijving, gewicht, actief
         FROM competenties
         ORDER BY naam ASC`
    );
    return rows;
};

//competentie ophalen op ID
export const getCompetentieById = async (id) => {
    const [rows] = await pool.query(
        `SELECT id, naam, omschrijving, gewicht, actief
         FROM competenties
         WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
};

//competentie aanmaken
export const createCompetentie = async ({ naam, omschrijving, gewicht }) => {
    const [result] = await pool.query(
        `INSERT INTO competenties (naam, omschrijving, gewicht, actief)
         VALUES (?, ?, ?, 1)`,
        [naam, omschrijving || null, gewicht]
    );
    return result.insertId;
};

//Competentie bijwerken
export const updateCompetentie = async ({ id, naam, omschrijving, gewicht }) => {
    await pool.query(
        `UPDATE competenties
         SET naam = ?, omschrijving = ?, gewicht = ?
         WHERE id = ?`,
        [naam, omschrijving || null, gewicht, id]
    );
};

// Controleren of er scores aan deze competentie gekoppeld zijn
export const heeftGekoppeldeScores = async (id) => {
    const [rows] = await pool.query(
        `SELECT COUNT(*) AS aantal
         FROM competentie_scores
         WHERE competentie_id = ?`,
        [id]
    );
    return rows[0].aantal > 0;
};

//competentie verwijderen
export const deleteCompetentie = async (id) => {
    await pool.query(
        `DELETE FROM competenties WHERE id = ?`,
        [id]
    );
};