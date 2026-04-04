import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const allowedRoles = ['student', 'commissie', 'docent', 'mentor', 'admin'];

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, naam, email, rol, eerste_login, aangemaakt_op FROM users ORDER BY aangemaakt_op DESC'
    );

    res.json({ users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kon gebruikers niet ophalen' });
  }
};

export const createUser = async (req, res) => {
  const { naam, email, wachtwoord, rol } = req.body;

  if (!naam || !email || !wachtwoord || !rol) {
    return res.status(400).json({ error: 'Alle velden zijn verplicht' });
  }

  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ error: 'Ongeldige rol' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Er bestaat al een gebruiker met dit e-mailadres' });
    }

    const wachtwoord_hash = await bcrypt.hash(wachtwoord, 10);

    const [result] = await pool.query(
      'INSERT INTO users (naam, email, wachtwoord_hash, rol, eerste_login) VALUES (?, ?, ?, ?, 1)',
      [naam, email, wachtwoord_hash, rol]
    );

    res.status(201).json({
      message: 'Gebruiker aangemaakt',
      user: {
        id: result.insertId,
        naam,
        email,
        rol,
        eerste_login: 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kon gebruiker niet aanmaken' });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!rol) {
    return res.status(400).json({ error: 'Rol is verplicht' });
  }

  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ error: 'Ongeldige rol' });
  }

  try {
    const [result] = await pool.query('UPDATE users SET rol = ? WHERE id = ?', [rol, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json({ message: 'Rol bijgewerkt' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kon rol niet bijwerken' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (req.session.user && String(req.session.user.id) === String(id)) {
    return res.status(400).json({ error: 'Je kunt je eigen account niet verwijderen' });
  }

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json({ message: 'Gebruiker verwijderd' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kon gebruiker niet verwijderen' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { naam, rol } = req.body;

  if (naam === undefined && rol === undefined) {
    return res.status(400).json({ error: 'Er is geen aanpassing opgegeven' });
  }

  if (rol !== undefined && !allowedRoles.includes(rol)) {
    return res.status(400).json({ error: 'Ongeldige rol' });
  }

  if (naam !== undefined && String(naam).trim() === '') {
    return res.status(400).json({ error: 'Naam mag niet leeg zijn' });
  }

  try {
    const updates = [];
    const values = [];

    if (naam !== undefined) {
      updates.push('naam = ?');
      values.push(String(naam).trim());
    }

    if (rol !== undefined) {
      updates.push('rol = ?');
      values.push(rol);
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json({ message: 'Gebruiker bijgewerkt' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Kon gebruiker niet bijwerken' });
  }
};