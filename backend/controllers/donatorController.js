const Donator = require("../models/donator")
const Donation = require("../models/donation")


const getpublicdonator = async (req, res) => {
    try {
        const donators = await Donator.find({}, {
            name: 1,
            bio: 1,
            photo: 1,
            username: 1
        }).lean();
        if (!donators) {
            return res.status(404).json({ error: 'Donators not found' });
        }
        res.json(donators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getonepublicdonator = async (req, res) => {
    try {
        const donator = await Donator.findById(req.params.id, {
            name: 1,
            bio: 1,
            photo: 1,
            username: 1,
        }).lean();
        const donations = await Donation.find({ donator_id: req.params.id }, {
            campaign_id: 1
        }).populate(
            {
                path: "campaign_id",
                select: "title"
            }
        ).lean();
        if (!donator) {
            return res.status(404).json({ error: 'Donator not found' });
        }
        res.json({ donator, donations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getDonor = async (req, res) => {
    try {
        console.log("req.userId", req.userId)
        const donator = await Donator.findById(req.userId, {
            name: 1,
            bio: 1,
            photo: 1,
            username: 1,
        }).lean();
        if (!donator) {
            return res.status(404).json({ error: 'Donator not found' });
        }
        const total_campaigns = await Donation.distinct("campaign_id", {
            donator_id: req.params.id,
            status: "approved" // optional but recommended
        });

        const count = total_campaigns.length;
        const total_amount = await Donation.aggregate([
            { $match: { donator_id: req.params.id } },
            { $group: { _id: null, total_amount: { $sum: "$amount" } } }
        ]);
        console.log("donator,count,total_amount", donator, count, total_amount)
        res.json({ donator, count, total_amount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const updateDonor = async (req, res) => {
    try {
        let photo;
        if (req.uploadedFile && req.uploadedFile.url) {
            photo = req.uploadedFile.url;
        }
        console.log(req.body)
        const donator = await Donator.findByIdAndUpdate(req.userId, { photo, ...req.body }, { returnDocument: 'after' });
        console.log("donator", donator)
        if (!donator) {
            return res.status(404).json({ error: 'Donator not found' });
        }
        res.json({ donator, message: "Donator updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteDonor = async (req, res) => {
    try {
        const donator = await Donator.findByIdAndDelete(req.params.id);
        if (!donator) {
            return res.status(404).json({ error: 'Donator not found' });
        }
        res.json(donator);
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getpublicdonator,
    getonepublicdonator,
    getDonor,
    updateDonor,
    deleteDonor
}