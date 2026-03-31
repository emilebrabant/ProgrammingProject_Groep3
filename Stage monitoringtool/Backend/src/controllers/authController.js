import bcrypt from 'bcrypt';
import pool from '../config/db.js';

export const login = async (req, res) => {
  const { email, wachtwoord } = req.body;

  // Validatie
  if (!email || !wachtwoord) {
    return res.status(400).json({ error: 'E-mail en wachtwoord zijn verplicht' });
  }

  try {
    // Gebruiker opzoeken
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Ongeldig e-mailadres of wachtwoord' });
    }

    const user = rows[0];

    // Wachtwoord vergelijken
    const correct = await bcrypt.compare(wachtwoord, user.wachtwoord_hash);
    if (!correct) {
      return res.status(401).json({ error: 'Ongeldig e-mailadres of wachtwoord' });
    }

    // Sessie opslaan
    req.session.user = {
      id: user.id,
      naam: user.naam,
      email: user.email,
      rol: user.rol
    };

    res.json({
      message: 'Ingelogd',
      user: req.session.user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Serverfout' });
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Uitgelogd' });
};