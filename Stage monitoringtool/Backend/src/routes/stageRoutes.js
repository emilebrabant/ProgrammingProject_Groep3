//routes voor stagevoorstellen
import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { indienen, getMijnStages, getAlle, getDocentenLijst, getEen } from '../controllers/stageController.js';


    const router = express.Router();

router.get('/docenten', isAuthenticated, getDocentenLijst);
router.get('/mijn', isAuthenticated, getMijnStages);
router.get('/', isAuthenticated, getAlle);
router.post('/', isAuthenticated, indienen);
router.get('/:id', isAuthenticated, getEen);

export default router;