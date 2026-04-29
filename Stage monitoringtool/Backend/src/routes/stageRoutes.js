//routes voor stagevoorstellen
import express from 'express';
import multer from 'multer';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import {
    indienen,
    getMijnStages,
    getAlle,
    getDocentenLijst,
    getEen,
    getHistoriek,
    verwerkBeslissing,
    updateMijnStage,
    uploadOvereenkomst,
    downloadOvereenkomst,
    valideerOvereenkomst,
    getMijnLogboeken,
    maakLogboek,
    getMentorLogboeken,
    aftekenenLogboekController,
    getDocentLogboeken,
    voegDocentFeedbackToe,
    getLogboekFeedback,
} from '../controllers/stageController.js';


    const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const bestandsnaam = file?.originalname?.toLowerCase() || '';
        const isPdf = file.mimetype === 'application/pdf' || bestandsnaam.endsWith('.pdf');
        if (!isPdf) {
            return cb(new Error('Enkel PDF-bestanden zijn toegestaan'));
        }
        return cb(null, true);
    },
});

const handlePdfUpload = (req, res, next) => {
    upload.single('bestand')(req, res, (err) => {
        if (!err) {
            return next();
        }

        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Bestand is te groot. Maximum toegelaten grootte is 10 MB.',
            });
        }

        return res.status(400).json({
            error: err.message || 'Upload mislukt',
        });
    });
};

router.get('/docenten', isAuthenticated, getDocentenLijst);
router.get('/mijn', isAuthenticated, getMijnStages);
router.get('/logboeken/mijn', isAuthenticated, getMijnLogboeken);
router.get('/', isAuthenticated, getAlle);
router.post('/', isAuthenticated, indienen);
router.post('/logboeken', isAuthenticated, maakLogboek);
router.patch('/:id', isAuthenticated, updateMijnStage);
router.post('/:id/overeenkomst', isAuthenticated, handlePdfUpload, uploadOvereenkomst);
router.get('/:id/overeenkomst', isAuthenticated, downloadOvereenkomst);
router.patch('/:id/overeenkomst/validatie', isAuthenticated, valideerOvereenkomst);
router.get('/:id/historiek', isAuthenticated, getHistoriek);
router.get('/logboeken/mentor', isAuthenticated, getMentorLogboeken);
router.get('/logboeken/docent', isAuthenticated, getDocentLogboeken);
router.post('/logboeken/:id/feedback', isAuthenticated, voegDocentFeedbackToe);
router.patch('/logboeken/:id/aftekenen', isAuthenticated, aftekenenLogboekController);
router.get('/logboeken/:id/feedback', isAuthenticated, getLogboekFeedback);
router.get('/:id', isAuthenticated, getEen);
router.patch('/:id/beslissing', isAuthenticated, verwerkBeslissing);

export default router;