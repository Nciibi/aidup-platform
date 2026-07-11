const express = require('express');
const router = express.Router();
const {getallcategories} = require('../controllers/categoryController');

router.get('/getall', getallcategories);

module.exports = router;