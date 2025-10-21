import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import Footer from '../../components/Footer/Footer.jsx';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [orderData, setOrderData] = useState(null);

  // Order data - in a real app, this would come from an API or context
  const defaultOrderData = {
    orderNumber: 'TT-2025-09-1A4C',
    deliveryDate: 'October 3, 2025',
    items: [
      { 
        id: 1, 
        name: 'Hand-Carved Wooden Mask', 
        quantity: 1, 
        image: '/assets/images/wooden.jpg',
        artisan: 'Kathmandu Carvers'
      },
      { 
        id: 2, 
        name: 'Traditional Pashmina Scarf', 
        quantity: 2, 
        image: '/assets/images/pashnima.jpg',
        artisan: 'Himalayan Weavers'
      }
    ],
    shippingAddress: {
      name: 'Sajid Ahmad',
      line1: 'Swami Bhawan, SVNIT Campus',
      line2: 'Surat, Gujarat - 395007'
    },
    paymentMethod: {
      method: 'eSewa',
      identifier: '**** **** **89'
    },
    pricing: {
      mrp: 6500,
      discount: 500,
      total: 6000
    }
  };

  useEffect(() => {
    // In a real app, you would fetch order data from an API or context
    // For now, we'll use the default data and simulate loading
    const timer = setTimeout(() => {
      setOrderData(defaultOrderData);
      
      // Clear cart from localStorage (simulating checkout completion)
      localStorage.removeItem('cart');
      
      // Update notification badges (you might want to implement this in a context)
      updateNotificationBadges();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const updateNotificationBadges = () => {
    // This function would update cart/wishlist badges throughout the app
    // You might want to implement this using React Context or state management
    console.log('Updating notification badges - cart cleared');
  };

  if (!orderData) {
    return (
      <div className="order-confirmation-page">
        <Header />
        <main className="confirmation-container">
          <div className="confirmation-box">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your order details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <Header />
      
      <main className="confirmation-container">
        <div className="confirmation-box">
          {/* Header */}
          <div className="confirmation-header">
            <div className="header-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h1>Thank You For Your Order!</h1>
            <p>Your piece of heritage is being prepared. We've sent a confirmation to your email.</p>
            <span className="order-number" id="order-number">
              Order {orderData.orderNumber}
            </span>
          </div>

          {/* Main Details Grid */}
          <div className="details-grid">
            {/* Left Column: Items */}
            <div className="order-items-column">
              <h3>Items in Your Order</h3>
              <div className="order-items-list" id="order-items-list">
                {orderData.items.map(item => (
                  <div key={item.id} className="order-item-card">
                    <img src={item.image} alt={item.name} />
                    <div className="order-item-details">
                      <h5>{item.name}</h5>
                      <p>by {item.artisan}</p>
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Shipping & Payment */}
            <div className="shipping-payment-column">
              <div className="detail-card">
                <h4>Delivering To</h4>
                <div id="shipping-address-display">
                  <strong>{orderData.shippingAddress.name}</strong>
                  <p>
                    {orderData.shippingAddress.line1}<br />
                    {orderData.shippingAddress.line2}
                  </p>
                </div>
                <p className="delivery-estimate">
                  <i className="fa-solid fa-truck-fast"></i>
                  Estimated Delivery: <strong id="delivery-date">{orderData.deliveryDate}</strong>
                </p>
              </div>
              <div className="detail-card">
                <h4>Payment Method</h4>
                <div id="payment-method-display">
                  <strong>{orderData.paymentMethod.method}</strong>
                  <p>{orderData.paymentMethod.identifier}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="price-summary-section">
            <h3>Price Summary</h3>
            <div className="price-summary-box">
              <div className="price-row">
                <span>Total MRP</span>
                <span id="summary-mrp">Rs. {orderData.pricing.mrp.toLocaleString()}</span>
              </div>
              <div className="price-row">
                <span>Discount</span>
                <span id="summary-discount" className="discount-amount">
                  - Rs. {orderData.pricing.discount.toLocaleString()}
                </span>
              </div>
              <div className="price-row">
                <span>Shipping Fee</span>
                <span>Free</span>
              </div>
              <div className="price-row total">
                <span>Total Amount</span>
                <span id="summary-total">Rs. {orderData.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Artisan's Note - Unique Feature */}
          <div className="artisan-note">
            <i className="fa-solid fa-pen-fancy"></i>
            <div>
              <h4>A Note from Our Artisans</h4>
              <p>
                Each item you've purchased was crafted with generations of skill and passion. 
                Thank you for supporting our community and helping us keep these timeless traditions alive.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/profile?section=orders" className="cta-button">
              <i className="fa-solid fa-box-archive"></i>
              Go to My Orders
            </Link>
            <Link to="/" className="cta-button secondary">
              <i className="fa-solid fa-arrow-left"></i>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;