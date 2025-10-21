import React, { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import { contactAPI } from '../../services/contactAPI'; // Import the new API service
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const recaptchaRef = useRef();

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on page load
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            showNotification('Please complete the reCAPTCHA.', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const response = await contactAPI.sendContactMessage({ ...formData, recaptchaToken });
            showNotification(response.message, 'success');
            // Reset form
            setFormData({ name: '', email: '', subject: '', message: '' });
            recaptchaRef.current.reset();
            setRecaptchaToken(null);
        } catch (error) {
            showNotification(error.message || 'Failed to send message. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
    };

    return (
        <div className="contact-page">
            {notification.show && (
                <NotificationPopup
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ show: false, message: '', type: '' })}
                />
            )}
            <div className="contact-header-section">
                <h1>Get in Touch</h1>
                <p>We'd love to hear from you. Whether you have a question, feedback, or a special request, our team is ready to answer all your questions.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="info-block">
                        <i className="fa-solid fa-map-marker-alt"></i>
                        <div>
                            <h4>Our Address</h4>
                            <p>123 Artisan Path, Thamel, Kathmandu, Nepal</p>
                        </div>
                    </div>
                    <div className="info-block">
                        <i className="fa-solid fa-envelope"></i>
                        <div>
                            <h4>Email Us</h4>
                            <p>support@timelesstribe.com</p>
                        </div>
                    </div>
                    <div className="info-block">
                        <i className="fa-solid fa-phone"></i>
                        <div>
                            <h4>Call Us</h4>
                            <p>+977 980-0000000</p>
                        </div>
                    </div>
                    <div className="info-block">
                        <i className="fa-solid fa-clock"></i>
                        <div>
                            <h4>Working Hours</h4>
                            <p>Sun - Fri: 10:00 AM - 6:00 PM (NPT)</p>
                        </div>
                    </div>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                        <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Your Name *</label>
                            <input type="text" id="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Your Email *</label>
                            <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="subject">Subject *</label>
                        <input type="text" id="subject" value={formData.subject} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Your Message *</label>
                        <textarea id="message" rows="6" value={formData.message} onChange={handleChange} required></textarea>
                    </div>
                    <div className="form-group recaptcha-wrapper">
                         <ReCAPTCHA
                           ref={recaptchaRef}
                           sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                           onChange={(token) => setRecaptchaToken(token)}
                           onExpired={() => setRecaptchaToken(null)}
                         />
                    </div>
                    <button type="submit" className="cta-button" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
            <div className="map-section">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.27689282601!2d85.2911132415893!3d27.70903024248065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0x7d9d976de5ba3b4!2sThamel%2C%20Kathmandu%2044600%2C%20Nepal!5e0!3m2!1sen!2sin!4v1666352943183!5m2!1sen!2sin" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location in Thamel, Kathmandu"
                ></iframe>
            </div>
        </div>
    );
};

export default Contact;
