-- alle data verwijderen om opnieuw te starten
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS competentie_scores;
DROP TABLE IF EXISTS evaluaties;
DROP TABLE IF EXISTS competenties;
DROP TABLE IF EXISTS logboek_feedback;
DROP TABLE IF EXISTS logboeken;
DROP TABLE IF EXISTS overeenkomsten;
DROP TABLE IF EXISTS stage_historiek;
DROP TABLE IF EXISTS stages;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;