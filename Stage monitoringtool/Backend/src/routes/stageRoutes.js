//routes voor stagevoorstellen
import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { indienen, getMijnStages, getAlle, getDocentenLijst, getEen, getHistoriek, verwerkBeslissing, updateMijnStage } from '../controllers/stageController.js';


    const router = express.Router();

router.get('/docenten', isAuthenticated, getDocentenLijst);
router.get('/mijn', isAuthenticated, getMijnStages);
router.get('/', isAuthenticated, getAlle);
router.post('/', isAuthenticated, indienen);
router.patch('/:id', isAuthenticated, updateMijnStage);
router.get('/:id/historiek', isAuthenticated, getHistoriek);
router.get('/:id', isAuthenticated, getEen);
router.patch('/:id/beslissing', isAuthenticated, verwerkBeslissing);

export default router;