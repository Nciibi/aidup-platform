/**
 * seed.js  –  Populate AidUp DB with test data
 *
 * Usage:  node scripts/seed.js
 *
 * Creates:
 *   - 1 Organizer
 *   - 1 Donator
 *   - 3 Categories
 *   - 3 Campaigns  (each with a banner + extra images downloaded to uploads/)
 *   - 3 Donations  (one per campaign)
 *   - 3 CampainDonation aggregation docs
 *   - 1 OrgVerification (approved)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ── Models ────────────────────────────────────────────────────────────
const Organizer = require('../models/organizer');
const Donator = require('../models/donator');
const Campaign = require('../models/campaign');
const Category = require('../models/category');
const Donation = require('../models/donation');
const CampainDonation = require('../models/campaindonation');
const OrgVerification = require('../models/orgverification');

// ── Config ────────────────────────────────────────────────────────────
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aidup';
const SEED_IMG_DIR = path.resolve(__dirname, '../uploads/images/seed');

// ── Image URLs (free, public-domain / CC0 from picsum & unsplash) ────
const IMAGE_URLS = {
    // Campaign 1 – Clean Water
    banner1: 'https://picsum.photos/id/1015/1600/900',  // river landscape
    img1a:   'https://picsum.photos/id/1039/800/600',    // waterfall
    img1b:   'https://picsum.photos/id/1043/800/600',    // nature

    // Campaign 2 – Education / Schools
    banner2: 'https://picsum.photos/id/180/1600/900',    // building 
    img2a:   'https://picsum.photos/id/24/800/600',      // books
    img2b:   'https://picsum.photos/id/20/800/600',      // landscape

    // Campaign 3 – Medical Aid
    banner3: 'https://picsum.photos/id/433/1600/900',    // people
    img3a:   'https://picsum.photos/id/375/800/600',     // nature scene
    img3b:   'https://picsum.photos/id/399/800/600',     // warm scene

    // Campaign 4 – Reforestation
    banner4: 'https://picsum.photos/id/28/1600/900',     // forest
    img4a:   'https://picsum.photos/id/10/800/600',      // trees
    img4b:   'https://picsum.photos/id/11/800/600',      // nature

    // Campaign 5 – Disaster Relief
    banner5: 'https://picsum.photos/id/124/1600/900',    // city landscape
    img5a:   'https://picsum.photos/id/122/800/600',     // town
    img5b:   'https://picsum.photos/id/119/800/600',     // people stuff
};

// ── Helpers ───────────────────────────────────────────────────────────

/** Follow redirects and download a URL to a local file path */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const client = url.startsWith('https') ? https : http;

        const request = (currentUrl) => {
            client.get(currentUrl, (response) => {
                // Follow redirects (3xx)
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    return request(response.headers.location);
                }
                if (response.statusCode !== 200) {
                    fs.unlinkSync(dest);
                    return reject(new Error(`Download failed: HTTP ${response.statusCode} for ${currentUrl}`));
                }
                response.pipe(file);
                file.on('finish', () => file.close(resolve));
            }).on('error', (err) => {
                fs.unlinkSync(dest);
                reject(err);
            });
        };

        request(url);
    });
}

/** Download all images if they don't already exist locally */
async function downloadAllImages() {
    if (!fs.existsSync(SEED_IMG_DIR)) {
        fs.mkdirSync(SEED_IMG_DIR, { recursive: true });
    }

    const localPaths = {};

    for (const [key, url] of Object.entries(IMAGE_URLS)) {
        const filename = `${key}.jpg`;
        const dest = path.join(SEED_IMG_DIR, filename);
        const publicUrl = `/uploads/images/seed/${filename}`;

        if (!fs.existsSync(dest)) {
            process.stdout.write(`  ⬇  Downloading ${key}...`);
            await downloadFile(url, dest);
            console.log(' ✅');
        } else {
            console.log(`  ✔  ${key} already exists, skipping`);
        }

        localPaths[key] = publicUrl;
    }

    return localPaths;
}

// ── Main Seed Function ───────────────────────────────────────────────
async function seed() {
    console.log('\n🌱  AidUp Database Seeder\n');
    console.log('📦  Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected!\n');

    // ── 1. Clean previous seed data ──────────────────────────────────
    console.log('🧹  Clearing existing data ...');
    await Promise.all([
        Organizer.deleteMany({}),
        Donator.deleteMany({}),
        Campaign.deleteMany({}),
        Category.deleteMany({}),
        Donation.deleteMany({}),
        CampainDonation.deleteMany({}),
        OrgVerification.deleteMany({}),
    ]);
    console.log('✅  Collections cleared\n');

    // ── 2. Download images ───────────────────────────────────────────
    console.log('🖼️   Downloading campaign images ...');
    const img = await downloadAllImages();
    console.log('✅  All images ready\n');

    // ── 3. Hash passwords ────────────────────────────────────────────
    const PLAIN_PASSWORD = 'Test1234!';
    const hashedPassword = await bcrypt.hash(PLAIN_PASSWORD, 10);

    // ── 4. Create Organizer ──────────────────────────────────────────
    console.log('👤  Creating Organizer ...');
    const organizer = await Organizer.create({
        name: 'Ahmed Ncibi',
        username: 'ahmed_organizer',
        bio: 'Passionate about making a difference in communities across the world.',
        location: 'Tunis, Tunisia',
        website: 'https://aiduporg.example.com',
        phone_number: '+21612345678',
        email: 'organizer@aidup.com',
        password: hashedPassword,
        role: 'organizer',
        is_verified: true,
        isVerified: true,
        contactemail: 'organizer@aidup.com',
    });
    console.log('   ✅  Organizer created:', organizer.email);

    // ── 5. Create Org Verification (approved) ────────────────────────
    const orgVerification = await OrgVerification.create({
        organizer_id: organizer._id,
        images: [img.img1a],
        name: 'AidUp Foundation',
        phone: '+21612345678',
        status: 'approved',
        review_comments: 'Organization verified by admin.',
        review_date: new Date(),
        submitted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    organizer.verification = orgVerification._id;
    await organizer.save();
    console.log('   ✅  OrgVerification created (approved)');

    // ── 6. Create Donator ────────────────────────────────────────────
    console.log('💳  Creating Donator ...');
    const donator = await Donator.create({
        name: 'Sara Belhaj',
        username: 'sara_donator',
        bio: 'Happy to contribute to good causes!',
        email: 'donator@aidup.com',
        password: hashedPassword,
        phoneNumber: '+21698765432',
        role: 'donator',
        isVerified: true,
    });
    console.log('   ✅  Donator created:', donator.email);

    // ── 7. Create Categories ─────────────────────────────────────────
    console.log('📂  Creating Categories ...');
    const [catWater, catEducation, catHealth] = await Category.create([
        { name: 'Water & Sanitation', description: 'Projects related to clean water access and sanitation infrastructure.' },
        { name: 'Education', description: 'Initiatives supporting schools, learning materials, and educational programs.' },
        { name: 'Healthcare', description: 'Medical aid, equipment, and health awareness campaigns.' },
    ]);
    console.log('   ✅  3 categories created');

    // ── 8. Create Campaigns ──────────────────────────────────────────
    console.log('📢  Creating Campaigns ...');

    const campaign1 = await Campaign.create({
        organizer_id: organizer._id,
        title: 'Clean Water for Rural Villages',
        description: 'Help us build water wells in remote villages where families walk miles for clean water every day.',
        story: 'In the rural areas of sub-Saharan Africa, over 300 million people lack access to clean drinking water. Our project installs solar-powered water pumps in 15 villages, providing sustainable clean water for over 10,000 people. Each well costs approximately $5,000 to build and serves a village for 20+ years.',
        goal: ['Build 15 water wells', 'Install solar pumps', 'Train local maintenance teams'],
        goal_amount: 75000,
        raised_amount: 23500,
        banner: img.banner1,
        images: [img.img1a, img.img1b],
        paiment_methods: [
            { method_type: 'CCP', details: '0023456789 clé 42' },
            { method_type: 'BaridiMob', details: '00799999000123456789' },
        ],
        status: 'approved',
        approved_at: new Date(),
        category: catWater._id,
        goal_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    });

    const campaign2 = await Campaign.create({
        organizer_id: organizer._id,
        title: 'Build a School in Jendouba',
        description: 'Support the construction of a modern primary school for 200 children in Jendouba, Tunisia.',
        story: 'Children in rural Jendouba walk over 8 km daily to reach the nearest school. Many drop out before completing primary education. Our project will build a 6-classroom school, a library, and a playground — giving 200 children the chance to learn close to home.',
        goal: ['Construct 6 classrooms', 'Build a library', 'Create a playground'],
        goal_amount: 120000,
        raised_amount: 45000,
        banner: img.banner2,
        images: [img.img2a, img.img2b],
        paiment_methods: [
            { method_type: 'CCP', details: '0098765432 clé 18' },
            { method_type: 'Bank Transfer', details: 'IBAN: TN59 1000 6035 1835 9847 8831' },
        ],
        status: 'approved',
        approved_at: new Date(),
        category: catEducation._id,
        goal_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
    });

    const campaign3 = await Campaign.create({
        organizer_id: organizer._id,
        title: 'Mobile Medical Clinic for Kasserine',
        description: 'Fund a fully-equipped mobile clinic to provide free healthcare to underserved communities in Kasserine.',
        story: 'Many families in Kasserine governorate are more than 50 km from the nearest hospital. Our mobile medical clinic will visit remote villages weekly, offering free consultations, vaccinations, and basic treatments. The fund covers the vehicle, medical equipment, and operating costs for the first year.',
        goal: ['Purchase mobile clinic vehicle', 'Equip with medical supplies', 'Hire medical staff for 1 year'],
        goal_amount: 95000,
        raised_amount: 12000,
        banner: img.banner3,
        images: [img.img3a, img.img3b],
        paiment_methods: [
            { method_type: 'BaridiMob', details: '00799999000987654321' },
        ],
        status: 'approved',
        approved_at: new Date(),
        category: catHealth._id,
        goal_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
    });

    const campaign4 = await Campaign.create({
        organizer_id: organizer._id,
        title: 'Reforestation in Ain Draham',
        description: 'Planting 10,000 native trees to restore regions affected by summer wildfires.',
        story: 'Forest fires have devastated Ain Draham\'s natural landscape and wildlife habitats. Our initiative works with local environmental groups to plant 10,000 oak and cork oak trees, reviving the ecosystem and protecting soil from erosion.',
        goal: ['Plant 10,000 trees', 'Hire 50 local workers', 'Install natural water catchment'],
        goal_amount: 50000,
        raised_amount: 15000,
        banner: img.banner4,
        images: [img.img4a, img.img4b],
        paiment_methods: [
            { method_type: 'Bank Transfer', details: 'IBAN: TN59 1000 6035 1835 1111 2222' },
        ],
        status: 'approved',
        approved_at: new Date(),
        category: catWater._id, // Just using an existing category for now
        goal_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days
    });

    const campaign5 = await Campaign.create({
        organizer_id: organizer._id,
        title: 'Emergency Food Relief in the South',
        description: 'Delivering necessary food supplies to families affected by severe droughts.',
        story: 'Extended droughts have left many rural families in southern regions without basic supplies. We are distributing food baskets that can support a family of 5 for an entire month, including flour, oil, sugar, and canned goods.',
        goal: ['Deliver 500 food baskets', 'Provide clean drinking water', 'Set up distribution centers'],
        goal_amount: 40000,
        raised_amount: 5000,
        banner: img.banner5,
        images: [img.img5a, img.img5b],
        paiment_methods: [
            { method_type: 'CCP', details: '0033445566 clé 99' },
            { method_type: 'BaridiMob', details: '00788888000444555' },
        ],
        status: 'approved',
        approved_at: new Date(),
        category: catHealth._id,
        goal_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });

    console.log('   ✅  5 campaigns created');

    // ── 9. Create Donations ──────────────────────────────────────────
    console.log('💰  Creating Donations ...');

    const donation1 = await Donation.create({
        donator_id: donator._id,
        campaign_id: campaign1._id,
        amount: 5000,
        currency: 'DZD',
        status: 'approved',
        submitted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        review_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        evidance: [img.img1a],
        paiment_method: [{ method_type: 'CCP', details: 'Transfer receipt #A001' }],
        description: 'For the clean water project – keep up the great work!',
    });

    const donation2 = await Donation.create({
        donator_id: donator._id,
        campaign_id: campaign2._id,
        amount: 15000,
        currency: 'DZD',
        status: 'approved',
        submitted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        review_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        evidance: [img.img2a],
        paiment_method: [{ method_type: 'Bank Transfer', details: 'Wire receipt #B002' }],
        description: 'Education changes lives. Happy to support!',
    });

    const donation3 = await Donation.create({
        donator_id: donator._id,
        campaign_id: campaign3._id,
        amount: 3000,
        currency: 'DZD',
        status: 'pending',
        submitted_date: new Date(),
        evidance: [img.img3a],
        paiment_method: [{ method_type: 'BaridiMob', details: 'BaridiMob receipt #C003' }],
        description: 'Healthcare for all!',
    });

    const donation4 = await Donation.create({
        donator_id: donator._id,
        campaign_id: campaign4._id,
        amount: 5000,
        currency: 'DZD',
        status: 'approved',
        submitted_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        review_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        evidance: [img.img4a],
        paiment_method: [{ method_type: 'Bank Transfer', details: 'Wire receipt #D004' }],
        description: 'Let\'s plant more trees!',
    });

    const donation5 = await Donation.create({
        donator_id: donator._id,
        campaign_id: campaign5._id,
        amount: 8000,
        currency: 'DZD',
        status: 'pending',
        submitted_date: new Date(),
        evidance: [img.img5a],
        paiment_method: [{ method_type: 'CCP', details: 'Transfer receipt #E005' }],
        description: 'Hope this helps the families in need.',
    });

    console.log('   ✅  5 donations created');

    // ── 10. Create Campaign Donation aggregations ────────────────────
    console.log('📊  Creating CampaignDonation records ...');
    await CampainDonation.create([
        { campaign_id: campaign1._id, donated_amount: 5000, donations: [donation1._id] },
        { campaign_id: campaign2._id, donated_amount: 15000, donations: [donation2._id] },
        { campaign_id: campaign3._id, donated_amount: 3000, donations: [donation3._id] },
        { campaign_id: campaign4._id, donated_amount: 5000, donations: [donation4._id] },
        { campaign_id: campaign5._id, donated_amount: 8000, donations: [donation5._id] },
    ]);
    console.log('   ✅  5 campaign donation records created');

    // ── Summary ──────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log('  🎉  SEED COMPLETE!');
    console.log('═'.repeat(55));
    console.log('');
    console.log('  ┌──────────────────────────────────────────────┐');
    console.log('  │  ORGANIZER                                   │');
    console.log('  │  Email:    organizer@aidup.com                │');
    console.log('  │  Password: Test1234!                          │');
    console.log('  ├──────────────────────────────────────────────┤');
    console.log('  │  DONATOR                                     │');
    console.log('  │  Email:    donator@aidup.com                  │');
    console.log('  │  Password: Test1234!                          │');
    console.log('  └──────────────────────────────────────────────┘');
    console.log('');
    console.log('  📢  Campaigns: 5 (all approved)');
    console.log('  💰  Donations: 5 (3 approved, 2 pending)');
    console.log('  🖼️   Images:   saved to uploads/images/seed/');
    console.log('');

    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB.\n');
}

// ── Run ──────────────────────────────────────────────────────────────
seed().catch((err) => {
    console.error('❌  Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
});
