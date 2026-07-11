const express = require('express');
const router = express.Router();
const { getAllpublicCampains, getpublicCampainById} = require('../controllers/campainController.js');

//=====================================
//for all users
//=====================================
router.get('/one/:id', getpublicCampainById);
router.get('/all', getAllpublicCampains);

module.exports = router;