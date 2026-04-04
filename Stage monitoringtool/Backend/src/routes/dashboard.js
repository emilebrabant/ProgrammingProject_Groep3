// Routes die data teruggeven per rol

// const express = fromv('express');
// const pool = from ('../config/db.js');
// const { isAuthenticated } = require('../middleware/authMiddleware.js');
// const { heeftRol } = require('../middleware/roleMiddleware.js');
// test of dit wel werkt:
import express from 'express';
import pool from '../config/db.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { heeftRol } from '../middleware/roleMiddleware.js';
const router = express.Router();

//STUDENT
// Student ziet enkel eigen stage, logboeken en evaluatie
router.get('/student', isAuthenticated, heeftRol(['student']), async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [stages] = await pool.query(
            'SELECT * FROM stages WHERE student_id = ?', [userId]
        );
        const [logboeken] = await pool.query(
            'SELECT * FROM logboeken WHERE student_id = ?', [userId]
        );
        const [evaluaties] = await pool.query(
            'SELECT * FROM evaluaties WHERE student_id = ?', [userId]
        );
        res.json({ stages, logboeken, evaluaties });
    } catch (error) {
        res.status(500).json({ fout: error.message });
    }
});

//COMMISSIE
// Commissie ziet alle ingediende voorstellen (geen logboeken of scores)
router.get('/commissie', isAuthenticated, heeftRol(['commissie']), async (req, res) => {
    try {
        const [voorstellen] = await pool.query(
            'SELECT * FROM stages WHERE status = "ingediend"'
        );
        res.json({ voorstellen });
    } catch (error) {
        res.status(500).json({ fout: error.message });
    }
});

//DOCENT
// Docent ziet enkel zijn gekoppelde studenten
router.get('/docent', isAuthenticated, heeftRol(['docent']), async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [studenten] = await pool.query(
            `SELECT u.id, u.naam, u.email, s.status, s.bedrijf_naam 
             FROM users u 
             JOIN stages s ON s.student_id = u.id 
             WHERE s.docent_id = ?`,
            [userId]
        );
        res.json({ studenten });
    } catch (error) {
        res.status(500).json({ fout: error.message });
    }
});

//MENTOR
// Mentor ziet enkel de studenten van zijn bedrijf
router.get('/mentor', isAuthenticated, heeftRol(['mentor']), async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [studenten] = await pool.query(
            `SELECT u.id, u.naam, u.email, s.status, s.omschrijving
             FROM users u
             JOIN stages s ON s.student_id = u.id
             WHERE s.mentor_id = ?`,
            [userId]
        );
        res.json({ studenten });
    } catch (error) {
        res.status(500).json({ fout: error.message });
    }
});

//ADMIN
//Admin heeft toegang tot alles dus ook gebruikersbeheer en competentiebeheer
router.get('/admin', isAuthenticated, heeftRol(['admin']), async (req, res) => {
    try {
        const [gebruikers] = await pool.query(
            'SELECT id, naam, email, rol FROM users'
        );
        const [stages] = await pool.query('SELECT * FROM stages');
        const [competenties] = await pool.query('SELECT * FROM competenties');
        res.json({ gebruikers, stages, competenties });
    } catch (error) {
        res.status(500).json({ fout: error.message });
    }
});

export default router;