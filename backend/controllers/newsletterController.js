const Subscriber = require('../models/Subscriber.js');


const subscribeToNewsletter = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    try {
        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            return res.status(200).json({ success: true, message: "You're already on our list! Thanks for being a part of the tribe." });
        }

        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();


        res.status(201).json({ success: true, message: 'Subscription successful! Welcome to the tribe.' });

    } catch (error) {
        // Handle validation errors (e.g., invalid email format)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
};

module.exports = {
    subscribeToNewsletter,
};
