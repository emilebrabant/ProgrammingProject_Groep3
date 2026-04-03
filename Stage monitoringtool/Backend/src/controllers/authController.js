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
      rol: user.rol,
      eerste_login: Boolean(user.eerste_login)
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

export const me = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Niet ingelogd' });
  }

  return res.json({ user: req.session.user });
};

export const changePasswordFirstLogin = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Niet ingelogd' });
  }

  const { huidigWachtwoord, nieuwWachtwoord, bevestigNieuwWachtwoord } = req.body;

  if (!huidigWachtwoord || !nieuwWachtwoord || !bevestigNieuwWachtwoord) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht' });
  }

  if (nieuwWachtwoord.length < 10) {
    return res.status(400).json({ error: 'Nieuw wachtwoord moet minstens 10 tekens hebben' });
  }

  if (nieuwWachtwoord !== bevestigNieuwWachtwoord) {
    return res.status(400).json({ error: 'Nieuw wachtwoord en bevestiging komen niet overeen' });
  }

  try {
    const [rows] = await pool.query('SELECT id, wachtwoord_hash FROM users WHERE id = ?', [req.session.user.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    const user = rows[0];
    const correct = await bcrypt.compare(huidigWachtwoord, user.wachtwoord_hash);

    if (!correct) {
      return res.status(400).json({ error: 'Huidig wachtwoord is ongeldig' });
    }

    const samePassword = await bcrypt.compare(nieuwWachtwoord, user.wachtwoord_hash);
    if (samePassword) {
      return res.status(400).json({ error: 'Nieuw wachtwoord moet verschillen van je huidige wachtwoord' });
    }

    const newPasswordHash = await bcrypt.hash(nieuwWachtwoord, 10);

    await pool.query(
      'UPDATE users SET wachtwoord_hash = ?, eerste_login = 0 WHERE id = ?',
      [newPasswordHash, req.session.user.id]
    );

    req.session.user = {
      ...req.session.user,
      eerste_login: false
    };

    return res.json({
      message: 'Wachtwoord succesvol aangepast',
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Serverfout' });
  }
};