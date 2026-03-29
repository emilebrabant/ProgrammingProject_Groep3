-- Wachtwoord voor iedereen is: Test1234
-- (bcrypt hash van "Test1234")
INSERT INTO users (naam, email, wachtwoord_hash, rol, eerste_login) VALUES
('Admin Systeem',   'admin@ehb.be',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',      0),
('Jan Commissie',   'commissie@ehb.be','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'commissie',  0),
('Sofie Docent',    'docent@ehb.be',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'docent',     0),
('Thomas Student',  'student@ehb.be',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student',    0),
('Lisa Mentor',     'mentor@ehb.be',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor',     0);

-- Startcompetencies
INSERT INTO competenties (naam, omschrijving, gewicht, actief) VALUES
('Technische vaardigheden',  'Kwaliteit van de technische uitvoering', 40.00, 1),
('Communicatie',             'Communicatie met collega\'s en begeleiders', 20.00, 1),
('Zelfstandigheid',          'Zelfstandig problemen oplossen', 20.00, 1),
('Professionele attitude',   'Stiptheid, betrokkenheid en teamwork', 20.00, 1);