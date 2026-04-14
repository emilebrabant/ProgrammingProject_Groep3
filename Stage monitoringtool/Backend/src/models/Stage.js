
// Alle SQL-queries voor de stages en stage_historiek tabel

import pool from '../config/db.js';

// Nieuw stagevoorstel aanmaken met status 'Ingediend'
export const createStage = async ({ student_id, docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum }) => {
    const [result] = await pool.query(
        `INSERT INTO stages (student_id, docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum, status, aangemaakt_op)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ingediend', NOW())`,
        [student_id, docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum]
    );
    return result.insertId;
};

// Controleer of student al een actief voorstel heeft (US-04)
export const getActiefVoorstelVanStudent = async (student_id) => {
    const [rows] = await pool.query(
        `SELECT * FROM stages WHERE student_id = ? AND status != 'afgekeurd'`,
        [student_id]
    );
    return rows[0] || null;
};

// Alle voorstellen van een student ophalen
export const getStagesVanStudent = async (student_id) => {
    const [rows] = await pool.query(
                `SELECT s.*, u.naam AS docent_naam,
                                (
                                        SELECT h.feedback
                                        FROM stage_historiek h
                                        WHERE h.stage_id = s.id
                                            AND h.feedback IS NOT NULL
                                            AND TRIM(h.feedback) != ''
                                        ORDER BY h.gewijzigd_op DESC, h.id DESC
                                        LIMIT 1
                                ) AS laatste_feedback
         FROM stages s
         LEFT JOIN users u ON s.docent_id = u.id
         WHERE s.student_id = ?
         ORDER BY s.aangemaakt_op DESC`,
        [student_id]
    );
    return rows;
};

// Alle stages ophalen voor de commissie, optioneel gefilterd op status
export const getAlleStages = async (statusFilter) => {
    let query = `
        SELECT s.*,
               student.naam AS student_naam,
                             docent.naam  AS docent_naam,
                             (
                                        SELECT h.feedback
                                        FROM stage_historiek h
                                        WHERE h.stage_id = s.id
                                            AND h.feedback IS NOT NULL
                                            AND TRIM(h.feedback) != ''
                                        ORDER BY h.gewijzigd_op DESC, h.id DESC
                                        LIMIT 1
                             ) AS laatste_feedback
        FROM stages s
        LEFT JOIN users student ON s.student_id = student.id
        LEFT JOIN users docent  ON s.docent_id  = docent.id
    `;
    const params = [];

    if (statusFilter) {
        query += ' WHERE s.status = ?';
        params.push(statusFilter);
    }

    query += ' ORDER BY s.aangemaakt_op DESC';

    const [rows] = await pool.query(query, params);
    return rows;
};

// Één stage ophalen op ID
export const getStageById = async (id) => {
    const [rows] = await pool.query(
        `SELECT s.*,
                student.naam AS student_naam,
                                docent.naam  AS docent_naam,
                                (
                                        SELECT h.feedback
                                        FROM stage_historiek h
                                        WHERE h.stage_id = s.id
                                            AND h.feedback IS NOT NULL
                                            AND TRIM(h.feedback) != ''
                                        ORDER BY h.gewijzigd_op DESC, h.id DESC
                                        LIMIT 1
                                ) AS laatste_feedback
         FROM stages s
         LEFT JOIN users student ON s.student_id = student.id
         LEFT JOIN users docent  ON s.docent_id  = docent.id
         WHERE s.id = ?`,
        [id]
    );
    return rows[0] || null;
};

// Volledige historiek van een stagevoorstel ophalen
export const getStageHistoriek = async (stage_id) => {
    const [rows] = await pool.query(
        `SELECT h.id,
                h.stage_id,
                h.status,
                h.feedback,
                h.gewijzigd_op,
                h.gewijzigd_door,
                u.naam AS gewijzigd_door_naam
         FROM stage_historiek h
         LEFT JOIN users u ON u.id = h.gewijzigd_door
         WHERE h.stage_id = ?
         ORDER BY h.gewijzigd_op ASC, h.id ASC`,
        [stage_id]
    );
    return rows;
};

// Historiek-entry aanmaken bij elke statuswijziging
export const addHistoriek = async ({ stage_id, status, feedback, gewijzigd_door }) => {
    await pool.query(
        `INSERT INTO stage_historiek (stage_id, status, feedback, gewijzigd_door, gewijzigd_op)
         VALUES (?, ?, ?, ?, NOW())`,
        [stage_id, status, feedback || null, gewijzigd_door]
    );
};

export const updateStageStatus = async ({ stage_id, status }) => {
    await pool.query(
        `UPDATE stages
         SET status = ?
         WHERE id = ?`,
        [status, stage_id]
    );
};

export const updateStageVoorstel = async ({
    stage_id,
    docent_id,
    bedrijf_naam,
    bedrijf_adres,
    contactpersoon,
    opdracht,
    start_datum,
    eind_datum,
}) => {
    await pool.query(
        `UPDATE stages
         SET docent_id = ?,
             bedrijf_naam = ?,
             bedrijf_adres = ?,
             contactpersoon = ?,
             opdracht = ?,
             start_datum = ?,
             eind_datum = ?,
             status = 'ingediend'
         WHERE id = ?`,
        [docent_id, bedrijf_naam, bedrijf_adres, contactpersoon, opdracht, start_datum, eind_datum, stage_id]
    );
};

// Alle docenten ophalen voor de dropdown
export const getDocenten = async () => {
    const [rows] = await pool.query(
        `SELECT id, naam FROM users WHERE rol = 'docent' ORDER BY naam ASC`
    );
    return rows;
};