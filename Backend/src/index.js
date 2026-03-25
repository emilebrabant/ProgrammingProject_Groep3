// Start de express server op poort 3000

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Zorgd dat de content kan communiceren met de backend
app.use(cors());
app.use(express.json());

// controle of de API werkt
app.get('/', (req, res) => {
    res.send('Stage Monitoring API werkt!');
});

// controle of de database verbinding werkt
app.get('/db-test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS resultaat');
        res.json({ 
            bericht: 'Database verbinding werkt!', 
            resultaat: rows[0].resultaat 
        });
    } catch (error) {
        res.status(500).json({ 
            fout: 'Database verbinding mislukt', 
            detail: error.message 
        });
    }
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
