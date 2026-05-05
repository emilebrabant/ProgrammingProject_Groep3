import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import {
    getStudentEvaluatie,
    slaZelfevaluatieOp,
} from '../controllers/evaluatieController.js';



const router = express.Router();

router.get('/student', isAuthenticated, getStudentEvaluatie);
router.post('/student/zelfevaluatie', isAuthenticated, slaZelfevaluatieOp);

export default router;