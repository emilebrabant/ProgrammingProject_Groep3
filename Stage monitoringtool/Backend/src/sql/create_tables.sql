-- tabellen aanmaken in database 2526PROGPROJ03
USE 2526PROGPROJ03;

-- USERS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  wachtwoord_hash VARCHAR(255) NOT NULL,
  rol ENUM('student','commissie','docent','mentor','admin') NOT NULL,
  eerste_login TINYINT(1) DEFAULT 1,
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STAGES
CREATE TABLE stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  docent_id INT NOT NULL,
  bedrijf_naam VARCHAR(150) NOT NULL,
  contactpersoon VARCHAR(100) NOT NULL,
  opdracht TEXT NOT NULL,
  start_datum DATE NOT NULL,
  eind_datum DATE NOT NULL,
  status ENUM('ingediend','goedgekeurd','afgekeurd','aanpassing_vereist') DEFAULT 'ingediend',
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (docent_id) REFERENCES users(id)
);

-- STAGE_HISTORIEK
CREATE TABLE stage_historiek (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  feedback TEXT,
  gewijzigd_door INT NOT NULL,
  gewijzigd_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (gewijzigd_door) REFERENCES users(id)
);

-- OVEREENKOMSTEN
CREATE TABLE overeenkomsten (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL UNIQUE,
  bestand_pad VARCHAR(255) NOT NULL,
  status ENUM('geupload','gevalideerd','afgekeurd') DEFAULT 'geupload',
  gevalideerd_door INT,
  gevalideerd_op TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (gevalideerd_door) REFERENCES users(id)
);

-- LOGBOEKEN
CREATE TABLE logboeken (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  weeknummer INT NOT NULL,
  taken TEXT NOT NULL,
  reflectie TEXT NOT NULL,
  leerpunten TEXT,
  afgetekend_door INT,
  afgetekend_op TIMESTAMP,
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (afgetekend_door) REFERENCES users(id)
);

-- LOGBOEK_FEEDBACK
CREATE TABLE logboek_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  logboek_id INT NOT NULL,
  user_id INT NOT NULL,
  tekst TEXT NOT NULL,
  aangemaakt_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (logboek_id) REFERENCES logboeken(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- COMPETENTIES
CREATE TABLE competenties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(150) NOT NULL,
  omschrijving TEXT,
  gewicht DECIMAL(5,2) NOT NULL,
  actief TINYINT(1) DEFAULT 1
);

-- EVALUATIES
CREATE TABLE evaluaties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stage_id INT NOT NULL,
  ingediend_door INT NOT NULL,
  ingediend_op TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  vergrendeld TINYINT(1) DEFAULT 0,
  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (ingediend_door) REFERENCES users(id)
);

-- COMPETENTIE_SCORES
CREATE TABLE competentie_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluatie_id INT NOT NULL,
  competentie_id INT NOT NULL,
  student_beschrijving TEXT,
  mentor_score INT,
  mentor_feedback TEXT,
  docent_score INT,
  docent_feedback TEXT,
  FOREIGN KEY (evaluatie_id) REFERENCES evaluaties(id),
  FOREIGN KEY (competentie_id) REFERENCES competenties(id)
);