
import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import {
    getAlle,
    maakAan,
    update,
    verwijder,
} from '../controllers/competentieController.js';

const router = express.Router();

router.get('/', isAuthenticated, getAlle);
router.post('/', isAuthenticated, maakAan);
router.patch('/:id', isAuthenticated, update);
router.delete('/:id', isAuthenticated, verwijder);

export default router;