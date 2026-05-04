
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
                                o.bestand_pad AS overeenkomst_bestand_pad,
                                o.status AS overeenkomst_status,
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
         LEFT JOIN overeenkomsten o ON o.stage_id = s.id
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
                             o.bestand_pad AS overeenkomst_bestand_pad,
                             o.status AS overeenkomst_status,
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
        LEFT JOIN overeenkomsten o ON o.stage_id = s.id
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
                                o.bestand_pad AS overeenkomst_bestand_pad,
                                o.status AS overeenkomst_status,
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
         LEFT JOIN overeenkomsten o ON o.stage_id = s.id
         WHERE s.id = ?`,
        [id]
    );
    return rows[0] || null;
};

export const getOvereenkomstByStageId = async (stage_id) => {
    const [rows] = await pool.query(
        `SELECT id, stage_id, bestand_pad, status, gevalideerd_door, gevalideerd_op
         FROM overeenkomsten
         WHERE stage_id = ?`,
        [stage_id]
    );

    return rows[0] || null;
};

export const upsertOvereenkomst = async ({ stage_id, bestand_pad }) => {
    await pool.query(
        `INSERT INTO overeenkomsten (stage_id, bestand_pad, status)
         VALUES (?, ?, 'geupload')
         ON DUPLICATE KEY UPDATE
             bestand_pad = VALUES(bestand_pad),
             status = 'geupload',
             gevalideerd_door = NULL,
             gevalideerd_op = NULL`,
        [stage_id, bestand_pad]
    );
};

export const updateOvereenkomstValidatie = async ({ stage_id, status, gevalideerd_door }) => {
    await pool.query(
        `UPDATE overeenkomsten
         SET status = ?,
             gevalideerd_door = ?,
             gevalideerd_op = NOW()
         WHERE stage_id = ?`,
        [status, gevalideerd_door, stage_id]
    );
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

export const getLogboekenVanStudent = async (student_id) => {
    const [rows] = await pool.query(
        `SELECT l.id,
                l.stage_id,
                l.weeknummer,
                l.taken,
                l.reflectie,
                l.leerpunten,
                l.mentor_commentaar,
                l.afgetekend_door,
                l.afgetekend_op,
                l.aangemaakt_op
         FROM logboeken l
         INNER JOIN stages s ON s.id = l.stage_id
         WHERE s.student_id = ?
         ORDER BY l.weeknummer DESC, l.aangemaakt_op DESC, l.id DESC`,
        [student_id]
    );

    return rows;
};

export const getGevalideerdeStageVanStudent = async (student_id) => {
    const [rows] = await pool.query(
        `SELECT s.id
         FROM stages s
         INNER JOIN overeenkomsten o ON o.stage_id = s.id
         WHERE s.student_id = ?
           AND o.status = 'gevalideerd'
         ORDER BY s.start_datum DESC, s.id DESC
         LIMIT 1`,
        [student_id]
    );

    return rows[0] || null;
};

export const getLogboekVoorStageEnWeek = async (stage_id, weeknummer) => {
    const [rows] = await pool.query(
        `SELECT id
         FROM logboeken
         WHERE stage_id = ? AND weeknummer = ?
         LIMIT 1`,
        [stage_id, weeknummer]
    );

    return rows[0] || null;
};

export const createLogboek = async ({ stage_id, weeknummer, taken, reflectie, leerpunten }) => {
    const [result] = await pool.query(
        `INSERT INTO logboeken (stage_id, weeknummer, taken, reflectie, leerpunten, aangemaakt_op)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [stage_id, weeknummer, taken, reflectie, leerpunten || null]
    );

    return result.insertId;
};


//logboeken ophalen van studenten die aan bepaaldementor gekoppeld zijn
export const getLogboekenVanMentor = async (mentor_naam) => {
    const [rows] = await pool.query(
        `SELECT l.id,
                l.stage_id,
                l.weeknummer,
                l.taken,
                l.reflectie,
                l.leerpunten,
                l.mentor_commentaar,
                l.afgetekend_door,
                l.afgetekend_op,
                l.aangemaakt_op,
                u.naam AS student_naam,
                u.email AS student_email,
                s.bedrijf_naam
         FROM logboeken l
         INNER JOIN stages s ON s.id = l.stage_id
         INNER JOIN users u ON u.id = s.student_id
         WHERE s.contactpersoon = ?
         ORDER BY u.naam ASC, l.weeknummer ASC`,
        [mentor_naam]
    );
    return rows;
};

//1 logboek ophalen op ID
export const getLogboekById = async (id) => {
    const [rows] = await pool.query(
        `SELECT l.*,
                s.contactpersoon,
                u.naam AS student_naam
         FROM logboeken l
         INNER JOIN stages s ON s.id = l.stage_id
         INNER JOIN users u ON u.id = s.student_id
         WHERE l.id = ?`,
        [id]
    );
    return rows[0] || null;
};

//Logboek aftekenen door mentor en commentaar
export const aftekenenLogboek = async (logboek_id, mentor_id, mentor_commentaar) => {
    await pool.query(
        `UPDATE logboeken
         SET afgetekend_door   = ?,
             afgetekend_op     = NOW(),
             mentor_commentaar = ?
         WHERE id = ?`,
        [mentor_id, mentor_commentaar || null, logboek_id]
    );
};


//logboeken ophalen van studenten gekoppeld aadocent
export const getLogboekenVanDocent = async (docent_id) => {
    const [rows] = await pool.query(
        `SELECT l.id,
                l.stage_id,
                l.weeknummer,
                l.taken,
                l.reflectie,
                l.leerpunten,
                l.afgetekend_door,
                l.afgetekend_op,
                l.mentor_commentaar,
                l.aangemaakt_op,
                u.naam AS student_naam,
                u.email AS student_email,
                s.bedrijf_naam
         FROM logboeken l
         INNER JOIN stages s ON s.id = l.stage_id
         INNER JOIN users u ON u.id = s.student_id
         WHERE s.docent_id = ?
         ORDER BY u.naam ASC, l.weeknummer ASC`,
        [docent_id]
 );
    return rows;
};

//docent feedback toevoege
export const addDocentFeedback = async (logboek_id, user_id, tekst) => {
    const [result] = await pool.query(
        `INSERT INTO logboek_feedback (logboek_id, user_id, tekst, aangemaakt_op)
         VALUES (?, ?, ?, NOW())`,
        [logboek_id, user_id, tekst]
    );
    return result.insertId;
};

//feedback ophalen van logboek
export const getFeedbackVanLogboek = async (logboek_id) => {
    const [rows] = await pool.query(
        `SELECT lf.id,
                lf.logboek_id,
                lf.tekst,
                lf.aangemaakt_op,
                u.naam AS auteur_naam,
                u.rol AS auteur_rol
         FROM logboek_feedback lf
         INNER JOIN users u ON u.id = lf.user_id
         WHERE lf.logboek_id = ?
         ORDER BY lf.aangemaakt_op ASC`,
        [logboek_id]
    );
return rows;
};



