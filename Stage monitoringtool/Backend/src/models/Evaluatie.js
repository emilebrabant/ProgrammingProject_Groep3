
import pool from '../config/db.js';

//actieve competenties ophalen
export const getActieveCompetenties = async () => {
    const [rows] = await pool.query(
        `SELECT id, naam, omschrijving, gewicht
         FROM competenties
         WHERE actief = 1
         ORDER BY naam ASC`
    );
    return rows;
};

//evaluatie ophalen van student
export const getEvaluatieVanStudent = async (stage_id) => {
    const [rows] = await pool.query(
        `SELECT id, stage_id, ingediend_door, ingediend_op, vergrendeld
         FROM evaluaties
         WHERE stage_id = ?
         LIMIT 1`, 
        [stage_id]
    );
    return rows[0] || null;
};

//nieuwe evaluatie make
export const createEvaluatie = async (stage_id, ingediend_door) => {
    const [result] = await pool.query(
        `INSERT INTO evaluaties (stage_id, ingediend_door, vergrendeld)
         VALUES (?, ?, 0)`,
        [stage_id, ingediend_door]
    );
    return result.insertId;
};

// scores evaluatie ophalen
export const getScoresVanEvaluatie = async (evaluatie_id) => {
    const [rows] = await pool.query(
        `SELECT cs.id,
                cs.competentie_id,
                cs.student_beschrijving,
                cs.mentor_score,
                cs.mentor_feedback,
                cs.docent_score,
                cs.docent_feedback,
                c.naam AS competentie_naam,
                c.omschrijving AS competentie_omschrijving,
                c.gewicht
         FROM competentie_scores cs
         INNER JOIN competenties c ON c.id = cs.competentie_id
         WHERE cs.evaluatie_id = ?
         ORDER BY c.naam ASC`,
        [evaluatie_id] 
    );
    return rows;
};

// Zelfevaluatie opslaan of bijwerkenper competentie
export const upsertStudentBeschrijving = async (evaluatie_id, competentie_id, student_beschrijving) => {
    await pool.query(
        `INSERT INTO competentie_scores (evaluatie_id, competentie_id, student_beschrijving)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE student_beschrijving = VALUES(student_beschrijving)`,
        [evaluatie_id, competentie_id, student_beschrijving]
    );
}; 