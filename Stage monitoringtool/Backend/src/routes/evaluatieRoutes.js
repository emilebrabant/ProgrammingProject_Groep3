import express from 'express';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import {
    getStudentEvaluatie,
    slaZelfevaluatieOp,

    getMentorEvaluatie,
    slaMentorScoreOp,
    dientEvaluatieIn,
} from '../controllers/evaluatieController.js';



const router = express.Router();

router.get('/student', isAuthenticated, getStudentEvaluatie);
router.post('/student/zelfevaluatie', isAuthenticated, slaZelfevaluatieOp);
router.get('/mentor', isAuthenticated, getMentorEvaluatie);
router.post('/mentor/score', isAuthenticated, slaMentorScoreOp);
router.patch('/mentor/indienen', isAuthenticated, dientEvaluatieIn);

export default router;