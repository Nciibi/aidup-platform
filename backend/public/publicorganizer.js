const express = require('express');
const router = express.Router();
const {getonepublicorganizor,getpublicorganizor} = require('../controllers/organizorController.js');

//=====================================
//for all users
//=====================================
router.get('/one/:id', getonepublicorganizor);
router.get('/all', getpublicorganizor);

module.exports = router;
