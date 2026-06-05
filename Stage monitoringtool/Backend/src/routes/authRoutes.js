import express from 'express';
import { changePasswordFirstLogin, login, logout, me } from '../controllers/authController.js';

const router = express.Router();

//api routes koppelen aan route
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);
router.post('/change-password-first-login', changePasswordFirstLogin);

export default router;