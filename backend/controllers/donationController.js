const Donation = require('../models/donation');
const mongoose = require('mongoose');
const Donator = require('../models/donator');
const Campain = require('../models/campaign');
const Paimentmethods = require('../models/paimentmethods');
const createDonation = async (req, res) => {
    try {
        let { campaign_id, donator_id, evidance, paiment_method, description } = req.body;

        // Use req.userId if available (from verifyJWT middleware), otherwise use donator_id from body
        const final_donator_id = req.userId || donator_id;

        // Support uploaded file from processImage middleware (single file upload)
        if (req.uploadedFile && req.uploadedFile.url) {
            evidance = [req.uploadedFile.url]; // Single file, wrap in array
        }

        // Parse paiment_method if it's sent as a JSON string from the mobile app
        if (typeof paiment_method === 'string') {
            try {
                paiment_method = JSON.parse(paiment_method);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid format for paiment_method' });
            }
        }

        if (!campaign_id) {
            return res.status(400).json({ success: false, message: 'campaign_id is required' });
        }

        const campain = await Campain.findById(campaign_id).lean().select('status');
        const donator = await Donator.findById(final_donator_id).lean().select('_id');
        
        if (!campain) {
            return res.status(404).json({ success: false, message: 'Campaign not found' });
        }
        if (!donator) {
            return res.status(404).json({ success: false, message: 'Donator not found' });
        }

        if (campain.status.toLowerCase() !== 'approved') {
            return res.status(400).json({ success: false, message: 'Campaign is not approved' });
        }

        const availableMethodsDoc = await Paimentmethods.find().lean().select('method_type');
        const availableMethodTypes = availableMethodsDoc.map(m => m.method_type);

        if (!evidance || (Array.isArray(evidance) && evidance.length === 0)) {
            return res.status(400).json({ success: false, message: 'Evidence is required' });
        }

        // Ensure evidance is an array
        if (!Array.isArray(evidance)) {
            evidance = [evidance];
        }

        // Ensure paiment_method is an array of strings
        let methodsArray = [];
        if (Array.isArray(paiment_method)) {
            methodsArray = paiment_method;
        } else if (paiment_method) {
            methodsArray = [paiment_method];
        }

        if (methodsArray.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one payment method is required' });
        }

        const donation = await Donation.create({ 
            campaign_id, 
            donator_id: final_donator_id, 
            evidance: evidance, // Don't wrap! It's already an array from middleware
            paiment_method: methodsArray.map(m => ({ method_type: String(m) })),
            description,
            submitted_date: new Date()
        });

        res.status(201).json({
            success: true, 
            data: donation, 
            message: 'Donation created successfully thank you for your generosity, your request will be reviewed by an admin and you will receive a notification when it is approved or rejected' 
        });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}
const getAllDonationsByDonator = async (req, res) => {
    try {
        const donator_id = req.userId;
        const donations = await Donation.find({ donator_id }) .populate('campaign_id', 'title').lean();
        
        return res.status(200).json({
            success: true,
            message: 'Donations fetched successfully',
            data: donations
        });
    } catch (error) {
        console.error('Error getting donations:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getAllApprovedDonationsByDonator = async (req, res) => {
    try {
        const donator_id = req.userId;
        const donations = await Donation.find({ donator_id, status: 'approved' }).populate('campaign_id', 'title').lean();
        
        return res.status(200).json({
            success: true,
            message: 'Donations fetched successfully',
            data: donations
        });
    } catch (error) {
        console.error('Error getting donations:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getAllPendingDonationsByDonator = async (req, res) => {
    try {
        const donator_id = req.userId;
        const donations = await Donation.find({ donator_id, status: 'pending' }).populate('campaign_id', 'title').lean();
        return res.status(200).json({
            success: true,
            message: 'Donations fetched successfully',
            data: donations
        });
    } catch (error) {
        console.error('Error getting donations:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getAllRejectedDonationsByDonator = async (req, res) => {
    try {
        const donator_id = req.userId;
        const donations = await Donation.find({ donator_id, status: 'rejected' }).populate('campaign_id', 'title').lean();
        return res.status(200).json({
            success: true,
            message: 'Donations fetched successfully',
            data: donations
        });
    } catch (error) {
        console.error('Error getting donations:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
module.exports = {
    createDonation,
    getAllDonationsByDonator,
    getAllApprovedDonationsByDonator,
    getAllPendingDonationsByDonator,
    getAllRejectedDonationsByDonator
}