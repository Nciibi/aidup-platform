const Category = require('../models/category');

const getallcategories = async (req, res) => {
    try {
        const categories = await Category.find().lean();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get categories' });
    }
}

module.exports = {getallcategories};