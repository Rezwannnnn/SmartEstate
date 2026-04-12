const express = require('express');
const router = express.Router();

const { property_input, getFilterProperty } = require('../controllers/propertyController');
const { getPropertyById } = require('../controllers/requestController');

router.post('/', property_input);
router.post('/filter', getFilterProperty);
router.get('/:id', getPropertyById);

module.exports = router;
