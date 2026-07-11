const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/admin');
const Donator = require('../models/donator');
const Organizer = require('../models/organizer');

const emailToClear = 'user@example.com';

async function clearUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aidup');
        console.log('Connected to MongoDB');

        const resultAdmin = await Admin.deleteOne({ email: emailToClear });
        const resultDonator = await Donator.deleteOne({ email: emailToClear });
        const resultOrganizer = await Organizer.deleteOne({ email: emailToClear });

        console.log(`Cleared ${emailToClear} from:`);
        console.log(`- Admin: ${resultAdmin.deletedCount}`);
        console.log(`- Donator: ${resultDonator.deletedCount}`);
        console.log(`- Organizer: ${resultOrganizer.deletedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Error clearing user:', error);
        process.exit(1);
    }
}

clearUser();
