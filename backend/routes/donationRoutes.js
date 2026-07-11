const express = require('express');
const router = express.Router();
const {createDonation} = require('../controllers/donationController');
const authorize = require('../middleware/authorize');
const auditLog = require('../middleware/auditLog');
const verifyJWT = require('../middleware/verifyJWT');
const loadUser = require('../middleware/loadUser');
const protect = [verifyJWT, loadUser];

const { upload, processMultipleImages, uploadErrorHandler } = require('../middleware/advancedUpload');
//================================
//donation management
//================================
router.post('/createDonation', protect, (req, res, next) => {
    upload.fields([{ name: 'evidance', maxCount: 10 }, { name: 'images', maxCount: 10 }])(req, res, (err) => {
        if (err) return uploadErrorHandler(err, req, res, next);
        // Normalize the file to req.file for the processImage middleware
        const file = (req.files['evidance'] && req.files['evidance'][0]) || 
                     (req.files['images'] && req.files['images'][0]);
        if (file) {
            req.file = file;
        }
        next();
    });
}, processMultipleImages, authorize('DONATOR'), auditLog('Create donation by donator'), (req, res, next) => {
    
    
    // After processMultipleImages, req.files.images is already an array of paths
    if (req.files && req.files.images && Array.isArray(req.files.images)) {
        // Check if already processed (array of strings) or still file objects
        if (typeof req.files.images[0] === 'string') {
            // Already processed by processMultipleImages
            req.body.evidance = req.files.images;
        } else {
            // Still file objects, map to paths
            req.body.evidance = req.files.images.map(file => file.path);
        }
    }
    
    // Handle evidance field if it exists
    if (req.files && req.files.evidance && Array.isArray(req.files.evidance)) {
        if (typeof req.files.evidance[0] === 'string') {
            req.body.evidance = req.files.evidance;
        } else {
            req.body.evidance = req.files.evidance.map(file => file.path);
        }
    }
    
    
    next();
}, createDonation);

module.exports = router;