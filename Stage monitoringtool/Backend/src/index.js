import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const dashboardRoutes = require('./routes/dashboard.js');

// CORS met correcte instellingen
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Sessie
app.use(session({
  secret: process.env.SESSION_SECRET || 'geheim',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
app.use('/api/auth', authRoutes);

// Test routes
app.get('/', (req, res) => {
  res.send('Stage Monitoring API werkt!');
});

app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultaat');
    res.json({ bericht: 'Database verbinding werkt!', resultaat: rows[0].resultaat });
  } catch (error) {
    res.status(500).json({ fout: 'Database verbinding mislukt', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});

// Dashboard route
app.use('/dashboard' , dashboardRoutes)