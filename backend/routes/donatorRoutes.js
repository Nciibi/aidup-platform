const express = require('express');
const router = express.Router();
const loadUser = require('../middleware/loadUser');
const {getDonationById} = require('../controllers/adminController.js');
const {getAllRejectedDonationsByDonator,getAllPendingDonationsByDonator,getAllApprovedDonationsByDonator,getAllDonationsByDonator} = require('../controllers/donationController.js');
const verifyJWT = require('../middleware/verifyJWT');
const protect = [verifyJWT, loadUser];

const { upload, processImage, uploadErrorHandler } = require('../middleware/advancedUpload');
const { getDonor, updateDonor, deleteDonor } = require('../controllers/donatorController');

const authorize = require('../middleware/authorize');  
const auditLog = require('../middleware/auditLog');
router.use(protect);


//=================================================================
//account management
//=================================================================
router.post('/editaccount', (req, res, next) => {
    upload.fields([{ name: 'photo', maxCount: 1 }])(req, res, (err) => {
        if (err) return uploadErrorHandler(err, req, res, next);
        // Normalize the file to req.file for the processImage middleware
        const file = (req.files['photo'] && req.files['photo'][0]);
        if (file) {
            req.file = file;
        }
        next();
    });
},
 processImage,authorize('DONATOR'), auditLog('Edit Donator Account'), 
 updateDonor);
router.get('/getaccount',authorize('DONATOR'),auditLog('Get account by donator'), getDonor);
router.delete('/deleteaccount',authorize('DONATOR'), auditLog('Delete account by donator'), deleteDonor);

//================================
//donation  management
//================================
router.get('/readdonaions/one/:id',authorize('DONATOR'),auditLog('Get one donation by donator'), getDonationById);
router.get('/readdonaions/all',authorize('DONATOR'),auditLog('Get all donations by donator'), getAllDonationsByDonator);
router.get('/readdonaions/all/approved',authorize('DONATOR'),auditLog('Get all approved donations by donator'), getAllApprovedDonationsByDonator);
router.get('/readdonaions/all/pending',authorize('DONATOR'),auditLog('Get all pending donations by donator'), getAllPendingDonationsByDonator);
router.get('/readdonaions/all/rejected',authorize('DONATOR'),auditLog('Get all rejected donations by donator'), getAllRejectedDonationsByDonator);

module.exports = router;