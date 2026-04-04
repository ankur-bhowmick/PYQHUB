const express = require('express');
const router = express.Router();
const { getRatings, addRating, deleteRating } = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', getRatings);
router.post('/', auth, addRating);
router.delete('/:id', auth, roleCheck('admin'), deleteRating);

module.exports = router;
