// models/Settings.js

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Using a fixed key makes it easy to find the single settings document
    key: { type: String, default: 'siteSettings', unique: true }, 
    freeShippingThreshold: {
        type: Number,
        required: true,
        default: 2000
    }
}, { timestamps: true });

// Ensure only one settings document can be created
settingsSchema.statics.getSingleton = async function() {
    let settings = await this.findOne({ key: 'siteSettings' });
    if (!settings) {
        settings = await this.create({ key: 'siteSettings' });
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;