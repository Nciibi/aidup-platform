const Campain = require('../models/campaign');
const Organizer = require('../models/organizer');
const CampainDonation = require('../models/campaindonation');
const Category = require('../models/category');
const Donation = require('../models/donation');
const Paiment_method = require('../models/paimentmethods');
const verif = async (userId) => {
    const isVerified = await Organizer.findOne({ _id: userId, is_verified: true });
    return !!isVerified;
}

//for verified organizers only
const getAllApprovedCampainsByOrganizer = async (req, res) => {
    try {
        const isVerified = await verif(req.userId);
        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'Organizer not verified' });
        }
        const campains = await Campain.find({ organizer_id: req.userId, status: 'approved' });
        return res.status(200).json(campains);

    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAllRejectedCampainsByOrganizer = async (req, res) => {
    try {
        const isVerified = await verif(req.userId);
        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'Organizer not verified' });
        }
        const campains = await Campain.find({ organizer_id: req.userId, status: 'rejected' });
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getAllPendingCampainsByOrganizer = async (req, res) => {
    try {
        const isVerified = await verif(req.userId);
        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'Organizer not verified' });
        }
        const campains = await Campain.find({ organizer_id: req.userId, status: 'pending' });
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//for verified organizers only
const getAllCampainsByOrganizer = async (req, res) => {
    try {
        const isVerified = await verif(req.userId);
        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'Organizer not verified' });
        }
        const campains = await Campain.find({ organizer_id: req.userId });
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//for verified organizers only
const addCampain = async (req, res) => {
    try {
        if(!req.userId){
            return res.status(401).json({ success: false, message: 'User not authenticated nice try' });
        }
        
        const organizer = await Organizer.findById(req.userId);
        if(!organizer){
            return res.status(401).json({ success: false, message: 'Organizer not found' });
        }
        const isVerified = await verif(req.userId);
        if (!isVerified) {
            return res.status(401).json({ success: false, message: 'Organizer not verified' });
        }
        if (typeof req.body.paiment_methods === 'string') {
            try {
                req.body.paiment_methods = JSON.parse(req.body.paiment_methods);
            } catch (e) {
                return res.status(400).json({ success: false, message: 'Invalid JSON format for paiment_methods' });
            }
        }
        const { title, description,category, goal_amount,images, videos,goal,story, paiment_methods, organizer_id ,goal_date ,banner} = req.body;
        if(!title || !description || !category || !goal_amount || !images || !videos || !paiment_methods || !organizer_id || !goal_date || !banner || !goal || !story){
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        const newCampain = await Campain.create({ 
            title,
            description, 
            goal_amount, 
            category,
            images,
            videos,
            raised_amount :"0" ,
            donators: [], 
            paiment_methods, 
            status: 'pending', 
            created_at: new Date(), 
            approved_at: null, 
            rejected_at: null, 
            organizer_id ,
            goal_date,
            banner,
            goal,
            story
        });
        return res.status(201).json(newCampain);
    } catch (error) {
        console.error('Error adding campain:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


//for admins
const getAllCampains = async (req, res) => {
    try {
        const campains = await Campain.find();
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//for admins
const getAllPendingCampains = async (req, res) => {
    try {
        const campains = await Campain.find({status: 'pending'});
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//for admins
const getAllApprovedCampains = async (req, res) => {
    try {
        const campains = await Campain.find({status: 'approved'});
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

//for admins
const getAllRejectedCampains = async (req, res) => {
    try {
        const campains = await Campain.find({status: 'rejected'});
        return res.status(200).json(campains);
    } catch (error) {
        console.error('Error getting campains:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getCampainById = async (req, res) => {
    try {
        const campain = await Campain.findById(req.params.id);
        if (!campain) {
            return res.status(404).json({ success: false, message: 'Campain not found' });
        }
        return res.status(200).json(campain);
    } catch (error) {
        console.error('Error getting campain:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateCampain = async (req, res) => {
    try {
        const id = req.params.id ;
        const body = req.body ;
        const campain = await Campain.findByIdAndUpdate(id, body, { new: true });
        if (!campain) {
            return res.status(404).json({ success: false, message: 'Campain not found' });
        }
        return res.status(200).json(campain);
    } catch (error) {
        console.error('Error updating campain:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const deleteCampain = async (req, res) => {
    try {
        const id = req.params.id ;
        const campain = await Campain.findByIdAndDelete(id);
        if (!campain) {
            return res.status(404).json({ success: false, message: 'Campain not found' });
        }
        return res.status(200).json(campain);
    } catch (error) {
        console.error('Error deleting campain:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getpublicCampainById = async (req, res) => {
    try {
        const uniqueDonors = await Donation.distinct("donator_id", {
      campaign_id: req.params.id , status: "approved"
    });

    const campain = await Campain.findById(req.params.id, {
                title: 1,
                story: 1,
                goal: 1,
                goal_date: 1,
                banner: 1,
                description: 1,
                category: 1,
                goal_amount: 1,
                images: 1,
                paiment_methods: 1,
                organizer_id: 1,
                category: 1
        })
        .populate({
            path: "organizer_id",
            select: "username photo"
        })
        .populate({
            path: "category",
            select: "name"
        })
        .lean();


        if (!campain) {
            return res.status(404).json({ error: 'Campain not found' });
        }

        const campainDonation = await CampainDonation.findOne(
            { campaign_id: req.params.id },
            { donated_amount: 1, donations: 1 }
        )
        .populate({
            path: "donations",
            select: "amount currency status submitted_date donator_id",
            populate: {
                path: "donator_id",
                select: "username photo"
            }
        })
        .lean();
        res.json({count : uniqueDonors.length,
            ...campain,
            campainDonation: campainDonation || { donated_amount: 0, donations: [] }
        });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};
const getAllpublicCampains = async (req, res) => {
    try {
            const campains = await Campain.find({status: 'approved'}, {
                    title: 1,
                    description: 1,
                    category: 1,
                    goal_amount: 1,
                    banner: 1,
                    videos: 1,
                    raised_amount: 1,
                    paiment_methods: 1,
                    organizer_id: 1
                })
                .populate({
                    path: "paiment_methods"
                })
                .populate({
                    path : "organizer_id",
                    select : "username photo"
                }).populate({
                    path: "category",
                    select: "name"
                })
                .lean();
            if (!campains) {
                return res.status(404).json({ error: 'campains not found' });
            }
            const raised_amounts = await CampainDonation.find({}, {campaign_id: 1, donated_amount: 1}).lean();
            const full_campain_data = campains.map(campain => {
                const raised_amount = raised_amounts.find(raised_amount => raised_amount.campaign_id.toString() === campain._id.toString());
                return {
                    ...campain,
                    raised_amount: raised_amount ? raised_amount.donated_amount : 0
                };
            });
            res.json(full_campain_data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
};



module.exports = {
    getAllpublicCampains, 
    getpublicCampainById,
    getAllApprovedCampains,
    getAllRejectedCampains,
    getAllPendingCampains,
    getAllRejectedCampainsByOrganizer,
    getAllPendingCampainsByOrganizer,
    getAllApprovedCampainsByOrganizer,
    getAllCampainsByOrganizer,
    addCampain,
    getAllCampains,
    getCampainById,
    updateCampain,
    deleteCampain
};