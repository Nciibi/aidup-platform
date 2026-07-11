const Organizor = require('../models/organizer');
const Campaign = require('../models/campaign');
const Donation = require('../models/donation');
const OrgVerification = require('../models/orgverification');
const Campaindonations = require('../models/campaindonation');
const getpublicorganizor = async (req, res) => {
  try {
    const organizors = await Organizor.find({}, {
      is_verified: 1,
      name: 1,
      bio: 1,
      location: 1,

    }).lean();
    if (!organizors) {
      return res.status(404).json({ error: 'Organizors not found' });
    }
    res.json(organizors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getonepublicorganizor = async (req, res) => {
  try {
    const organizor = await Organizor.findById(req.params.id, {
      is_verified: 1,
      name: 1,
      bio: 1,
      location: 1,
      website: 1,
      phone_number: 1,
      photo: 1,
      username: 1,
      contactemail: 1
    }).lean();
    if (!organizor) {
      return res.status(404).json({ error: 'Organizor not found' });
    }
    res.json(organizor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getDashboard = async (req, res) => {
  try {
    const organizerId = req.userId;
    console.log("organizerId", organizerId);
    const campaigns = await Campaign.find({ organizer_id: organizerId });
    
    const campaignIds = campaigns.map(c => c._id);

    const donations = await Donation.find({
      campaign_id: { $in: campaignIds },
      status: 'approved'
    }).populate('donator_id');
    
    const donorsMap = new Map();
    donations.forEach(d => {
      if (d.donator_id && !donorsMap.has(d.donator_id._id.toString())) {
        donorsMap.set(d.donator_id._id.toString(), d.donator_id);
      }
    });
    const donors = Array.from(donorsMap.values());
let succeededCampaigns = 0;
    const totalCampaigns = campaigns.length;
    for (const campaign of campaigns) {
      console.log("campaign", campaign.raised_amount ,campaign.goal_amount);
      if (campaign.raised_amount >= campaign.goal_amount) {
        succeededCampaigns++;
      }
    }
    const totalRaisedAmount = campaigns.reduce((total, campaign) => total + campaign.raised_amount, 0);
    const donorsCount = donors.length;
   
   
    const avgCampaignSuccess = totalCampaigns === 0 ? 0 : (succeededCampaigns / totalCampaigns);
    console.log("avgCampaignSuccess", donors,
        donorsCount,
        avgCampaignSuccess,
        totalRaisedAmount,
        campaigns);
    
    return res.status(200).json({
      success: true,
      data: {
        donors,
        donorsCount,
        avgCampaignSuccess,
        totalRaisedAmount,
        campaigns
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Dashboard error",
      error: error.message
    });
  }
};
const getOrganizerSituation = async (req, res) => {
  try {
    const organizor = await Organizor.findById(req.userId, {
      is_verified: 1,
    }).lean();
    let verification = await OrgVerification.findOne({ organizer_id: req.userId }).select('status');
    if (!verification) {
      verification = {
        status: 'not_submitted'
      }
    }
    const situation = {
      is_verified: organizor.is_verified,
      status: verification.status
    }
    if (!organizor) {
      return res.status(404).json({ error: 'Organizor not found' });
    }
    res.json(situation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getOrganizor = async (req, res) => {
  try {
    const organizor = await Organizor.findById(req.userId, {
      is_verified: 1,
      name: 1,
      bio: 1,
      photo: 1,
      location: 1,
      website: 1,
      phone_number: 1,
      username: 1,
      contactemail: 1
    }).lean();
    if (!organizor) {
      return res.status(404).json({ error: 'Organizor not found' });
    }
    res.json(organizor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateOrganizor = async (req, res) => {
  try {
          let photo;
           if (req.uploadedFile && req.uploadedFile.url) {
               photo = req.uploadedFile.url;
           }
           const organizor = await Organizor.findByIdAndUpdate(req.userId, { photo, ...req.body }, { returnDocument: 'after' });
           
           if (!organizor) {
               return res.status(404).json({ error: 'Organizor not found' });
           }
           res.json({ organizor, message: "Organizor updated successfully" });
  } catch (error) {
    console.log("\n\n[UPDATE ORGANIZER CONTROLLER ERROR]");
    
    res.status(500).json({ error: error.message });
  }
}
const deleteOrganizor = async (req, res) => {
  try {
    const organizor = await Organizor.findByIdAndDelete(req.params.id);
    if (!organizor) {
      return res.status(404).json({ error: 'Organizor not found' });
    }
    res.status(200).json(organizor);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const submitVerification = async (req, res) => {
  try {
    console.log("\n\n[SUBMIT VERIFICATION CONTROLLER HIT]");
    console.log("Submit Verification Trace:");
    console.log("- User ID:", req.userId);
    console.log("- Body:", req.body);
    console.log("- Files (raw):", !!req.files);
    console.log("- Images field type:", typeof req.files?.images);
    console.log("- Images content:", req.files?.images);
    const organizor = await Organizor.findById(req.userId, {
      is_verified: 1,
    }).lean();
    if (organizor.is_verified) {
      return res.status(400).json({ error: 'Organizor is already verified' });
    }
    const verification = await OrgVerification.findOne({ organizer_id: req.userId }).select('status');

    let newVerification;

    if (!verification || verification.status === 'not_submitted') {
      newVerification = new OrgVerification({
        organizer_id: req.userId,
        status: 'pending',
        images: req.files.images, // Now contains URLs from processMultipleImages
        submitted_date: Date.now(),
        name: req.body.name || organizor.name || "Unknown",
        phone: req.body.phone || organizor.phone_number || "Unknown"
      });

      await newVerification.save();

    } else if (verification.status === 'rejected') {
      newVerification = await OrgVerification.findByIdAndUpdate(
        verification._id,
        {
          organizer_id: req.userId,
          status: 'pending',
          images: req.files.images,
          submitted_date: Date.now(),
          name: req.body.name || organizor.name || "Unknown",
          phone: req.body.phone || organizor.phone_number || "Unknown"
        },
        { new: true } // returns updated doc
      );
    } else if (verification.status === 'pending' || verification.status === 'approved') {
      return res.status(400).json({ error: 'Organizor is already submitted for verification' });
    }
    res.status(200).json({ success: true, verification: newVerification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  submitVerification,
  getOrganizerSituation,
  getOrganizor,
  updateOrganizor,
  deleteOrganizor,
  getDashboard,
  getpublicorganizor,
  getonepublicorganizor,
}