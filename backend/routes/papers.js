const express = require('express');
const router = express.Router();
const {
    getPapersByUniversity, getAllPapers, createPaper, updatePaper,
    deletePaper, getStats, servePdf, searchPapers, getRecentPapers, incrementDownload
} = require('../controllers/paperController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../config/upload');

// Public routes
router.get('/search', searchPapers);
router.get('/recent', getRecentPapers);
router.get('/university/:universityId', getPapersByUniversity);
router.get('/view/:filename', servePdf);
router.post('/download/:id', incrementDownload);

// Admin routes
router.get('/all', auth, roleCheck('admin'), getAllPapers);
router.get('/stats', auth, roleCheck('admin'), getStats);
router.post('/', auth, roleCheck('admin'), upload.single('paperFile'), createPaper);
router.put('/:id', auth, roleCheck('admin'), upload.single('paperFile'), updatePaper);
router.delete('/:id', auth, roleCheck('admin'), deletePaper);

module.exports = router;
