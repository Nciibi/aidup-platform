const express = require('express');
const router = express.Router();
const loadUser = require('../middleware/loadUser');
const verifyJWT = require('../middleware/verifyJWT');
const { getAllRejectedCampainsByOrganizer, getAllPendingCampainsByOrganizer, getAllApprovedCampainsByOrganizer, getAllCampainsByOrganizer, getCampainById } = require('../controllers/campainController.js');
const protect = [verifyJWT, loadUser];
const { upload, processImage, uploadErrorHandler, processMultipleImages } = require('../middleware/advancedUpload');

const { getDashboard, getOrganizerSituation, getOrganizor, updateOrganizor, deleteOrganizor, submitVerification } = require('../controllers/organizorController.js');

const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
router.use(protect);

//=================================================================
//account management
//=================================================================
router.post('/editaccount', (req, res, next) => {
    upload.fields([{ name: 'evidance', maxCount: 1 }, { name: 'images', maxCount: 1 }])(req, res, (err) => {
        if (err) return uploadErrorHandler(err, req, res, next);
        // Normalize the file to req.file for the processImage middleware
        const file = (req.files['evidance'] && req.files['evidance'][0]) ||
            (req.files['images'] && req.files['images'][0]);
        if (file) {
            req.file = file;
        }
        next();
    });
}, processImage, uploadErrorHandler, authorize('ORGANIZER'), auditLog('Edit Organizer Account'), updateOrganizor);
router.get('/getaccount', authorize('ORGANIZER'), auditLog('Get account by organizer'), getOrganizor);
router.delete('/deleteaccount', authorize('ORGANIZER'), auditLog('Delete account by organizer'), deleteOrganizor);

//================================
//campain  management
//================================
router.get('/readcampains/one/:id', authorize('ORGANIZER'), auditLog('Get one campain by organizer'), getCampainById);
router.get('/readcampains/all', authorize('ORGANIZER'), auditLog('Get all campains by organizer'), getAllCampainsByOrganizer);
router.get('/readcampains/all/approved', authorize('ORGANIZER'), auditLog('Get all approved campains by organizer'), getAllApprovedCampainsByOrganizer);
router.get('/readcampains/all/pending', authorize('ORGANIZER'), auditLog('Get all pending campains by organizer'), getAllPendingCampainsByOrganizer);
router.get('/readcampains/all/rejected', authorize('ORGANIZER'), auditLog('Get all rejected campains by organizer'), getAllRejectedCampainsByOrganizer);

//==================================
//approutes
//==================================
router.get('/dashboard', authorize('ORGANIZER'), auditLog('Get dashboard by organizer'), getDashboard);
router.get('/organizerSituation', authorize('ORGANIZER'), auditLog('Get organizer situation'), getOrganizerSituation);


router.post('/submitVerification', (req, res, next) => {
    console.log(`\n\n[SUBMIT VERIFICATION ROUTE HIT] Auth Header: ${!!req.headers.authorization}, Content-Type: ${req.headers['content-type']}`);
    upload.fields([{ name: 'evidance', maxCount: 1 }, { name: 'images', maxCount: 5 }])(req, res, (err) => {
        if (err) {
            console.error("Multer upload error in route:", err);
            return uploadErrorHandler(err, req, res, next);
        }
        next();
    });
}, processMultipleImages, uploadErrorHandler, authorize('ORGANIZER'), auditLog('Submit verification'), submitVerification);










module.exports = router;
