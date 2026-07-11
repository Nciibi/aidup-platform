const express = require('express');
const router = express.Router();
const {getonepublicdonator,getpublicdonator} = require('../controllers/donatorController.js');

//=====================================
//for all users
//=====================================
router.get('/one/:id', getonepublicdonator);
router.get('/all', getpublicdonator);

module.exports = router;
