import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // React Vite poort
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'geheim',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server draait op poort ${process.env.PORT || 3000}`);
});