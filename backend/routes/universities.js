const express = require('express');
const router = express.Router();
const { getUniversities, getUniversity, createUniversity, updateUniversity, deleteUniversity } = require('../controllers/universityController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', getUniversities);
router.get('/:id', getUniversity);
router.post('/', auth, roleCheck('admin'), createUniversity);
router.put('/:id', auth, roleCheck('admin'), updateUniversity);
router.delete('/:id', auth, roleCheck('admin'), deleteUniversity);

module.exports = router;
