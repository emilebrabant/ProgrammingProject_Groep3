//routes voor stagevoorstellen
import express from 'express';
import { indienen, getMijnStages, getAlle, getDocentenLijst } from '../controllers/stageController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';

    const router = express.Router();

router.get('/docenten', isAuthenticated, getDocentenLijst);
router.get('/mijn', isAuthenticated, getMijnStages);
router.get('/', isAuthenticated, getAlle);
router.post('/', isAuthenticated, indienen);

export default router;