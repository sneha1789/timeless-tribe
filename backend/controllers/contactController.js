const { sendContactFormToAdmin, sendContactConfirmationToUser } = require('../utils/sendEmail');

const handleContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // Send email to the admin/business owner
        await sendContactFormToAdmin({ name, email, subject, message });

        // Send a confirmation email to the user who submitted the form
        await sendContactConfirmationToUser({ name, email });

        res.status(200).json({ success: true, message: "Thank you! Your message has been sent successfully." });

    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
    }
};

module.exports = { handleContactForm };
