// src/components/OrderCard/OrderCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './OrderCard.css'; // We will update this file

const OrderCard = ({ order }) => {
  // Basic validation in case order data is incomplete
  if (!order || !order._id || !order.orderItems || order.orderItems.length === 0) {
    console.warn("Incomplete order data passed to OrderCard:", order);
    return (
        <div className="order-card error-card">
            <p>Error displaying order details.</p>
        </div>
    );
  }

  // Function to get status styling
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return { text: 'Processing', colorClass: 'processing', icon: 'fa-solid fa-cogs' };
      case 'shipped': return { text: 'Shipped', colorClass: 'shipped', icon: 'fa-solid fa-truck-fast' };
      case 'delivered': return { text: 'Delivered', colorClass: 'delivered', icon: 'fa-solid fa-check-circle' };
      case 'cancelled': return { text: 'Cancelled', colorClass: 'cancelled', icon: 'fa-solid fa-times-circle' };
      case 'pending_payment': return { text: 'Pending Payment', colorClass: 'pending', icon: 'fa-solid fa-hourglass-half' };
      case 'payment_failed': return { text: 'Payment Failed', colorClass: 'failed', icon: 'fa-solid fa-exclamation-triangle' };
      case 'on-hold': return { text: 'On Hold', colorClass: 'on-hold', icon: 'fa-solid fa-pause-circle' };
      default: return { text: status || 'Unknown', colorClass: 'unknown', icon: 'fa-solid fa-question-circle' };
    }
  };

  const statusInfo = getStatusInfo(order.orderStatus);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { // Changed date format slightly
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className={`order-card status-${statusInfo.colorClass}`}> {/* Add status class for potential border coloring */}
      {/* Header Section */}
      <div className="order-card-header">
        <div className="order-meta">
          <span className="order-id">Order ID: #{order._id.slice(-8).toUpperCase()}</span>
          <span className="order-date">Placed on: {orderDate}</span>
        </div>
        <div className={`order-status-tag ${statusInfo.colorClass}`}>
          <i className={statusInfo.icon}></i> {statusInfo.text}
        </div>
      </div>

      {/* Body Section */}
      <div className="order-card-body">
         {/* Item Previews Section */}
        <div className="order-item-previews">
           {/* Show first few images, overlapping */}
          {order.orderItems.slice(0, 3).map((item, index) => (
            <div className="preview-image-wrapper" key={item.product + index}> {/* Use a unique key */}
              <img
                src={item.image || '/images/placeholder.jpg'}
                alt={item.name.substring(0, 20)} // Shorten alt text
                className="item-preview-img"
                title={item.name} // Show full name on hover
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
              />
            </div>
          ))}
          {/* Indicator for more items */}
          {order.orderItems.length > 3 && (
            <div className="preview-image-wrapper more-items-indicator">
              +{order.orderItems.length - 3}
            </div>
          )}
        </div>

        {/* Total and Action Section */}
        <div className="order-summary-action">
          <span className="order-total">Total: Rs. {order.totalPrice.toLocaleString()}</span>
          <Link to={`/order/${order._id}`} className="view-details-btn">
            View Details <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;