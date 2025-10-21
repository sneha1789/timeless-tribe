  import React from 'react';
  import { Link } from 'react-router-dom';
  import './Footer.css';

  const Footer = () => {
    return (
      <footer className="site-footer">
        <div className="footer-container">
          
          {/* Main content grid */}
          <div className="footer-main">

            {/* Column 1: About & Socials */}
            <div className="footer-column footer-about">
              <h4 className="footer-heading">Timeless Tribe</h4>
              <p className="footer-about-text">
                Authentic Nepali handicrafts connecting you with the rich cultural heritage of the Himalayas.
              </p>
              <div className="footer-social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            {/* Column 2: Shop Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Shop</h4>
              <ul className="footer-link-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/category/all">All Products</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Column 3: Help Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Help</h4>
              <ul className="footer-link-list">
                <li><Link to="/faq">FAQs</Link></li>
                <li><Link to="/shipping-info">Shipping Info</Link></li>
                <li><Link to="/returns">Returns & Exchanges</Link></li>
                <li><Link to="/track-order">Track Your Order</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom bar with copyright, policies, and payments */}
          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} Timeless Tribe. All Rights Reserved.
            </p>
            <div className="footer-policies">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <span className="separator">|</span>
              <Link to="/terms-of-service">Terms of Service</Link>
            </div>
            <div className="footer-payment-methods">
              <img src="/assets/images/esewa.jpg" alt="eSewa" title="eSewa" />
              <img src="/assets/images/khalti.png" alt="Khalti" title="Khalti" />
              <img src="/assets/images/visa.png" alt="Visa" title="Visa" />
              <img src="/assets/images/mastercard.png" alt="MasterCard" title="MasterCard" />
            </div>
          </div>

        </div>
      </footer>
    );
  };

  export default Footer;
