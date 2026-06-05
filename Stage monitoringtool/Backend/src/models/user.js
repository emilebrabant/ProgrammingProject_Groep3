// backend/models/user.js
const db = require("../config/database");

//maak een user
exports.create = async ({ email, wachtwoord_hash }) => {
  return db.query(
    "INSERT INTO users (email, wachtwoord_hash) VALUES (?, ?)",
    [email, wachtwoord_hash]
  );
};

//zoek op basis van email
exports.findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0]; // first user
};