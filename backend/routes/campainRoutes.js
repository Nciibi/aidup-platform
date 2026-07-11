const express = require('express');
const router = express.Router();
const loadUser = require('../middleware/loadUser');
const { addCampain, updateCampain, deleteCampain } = 
require('../controllers/campainController.js');
const verifyJWT = require('../middleware/verifyJWT');
const protect = [verifyJWT, loadUser];
const { upload, processImage, processMultipleImages, uploadErrorHandler } = require('../middleware/advancedUpload');
const authorize = require('../middleware/authorize');  
const auditLog = require('../middleware/auditLog');
router.use(protect);

//=====================================
//for verified organizers only
//=====================================
router.post('/managecampain/add',(req, res, next) => {
    
    upload.fields([{ name: 'images', maxCount: 10 }])(req, res, (err) => {
        if (err) return uploadErrorHandler(err, req, res, next);
        
        next();
    });
},authorize('ORGANIZER'), processMultipleImages, uploadErrorHandler, (req, res, next) => {
    // Map uploaded file URLs to req.body.images and req.body.banner
    if (req.files && req.files['images']) {
        const imageUrls = req.files['images'];
        req.body.images = imageUrls;
        if (imageUrls.length > 0) {
            req.body.banner = imageUrls[0];
        } else {
            req.body.banner = ""; // Fallback if no images are uploaded
        }
        console.log("\n\n[ADD CAMPAIGN ROUTE HIT]");
    }
    next();
}, auditLog('Create Campaign by organizer'), addCampain);
router.put('/managecampain/update/:id', (req, res, next) => {
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
}, authorize('organizer'),processImage, uploadErrorHandler ,auditLog('Update Campaign by organizer'), updateCampain);
router.delete('/managecampain/delete/:id',authorize('organizer'),auditLog('Delete Campaign by organizer'), deleteCampain);



module.exports = router;
