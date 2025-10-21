import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../services/orderAPI';
import { useAuth } from '../../context/AuthContext';
import LoadingPopup from '../../components/Popups/LoadingPopup';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import ConfirmPopup from '../../components/Popups/ConfirmPopup';
import './OrderDetailPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToCart, showLoginModal, user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false); // New state for invoice generation

  const showNotificationPopup = useCallback((message, type = 'info') => {
    setNotification({ show: true, message, type });
  }, []);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedOrder = await orderAPI.getOrderById(orderId);
      setOrder(fetchedOrder);
    } catch (err) {
      setError(err.message || 'Could not load order details.');
      showNotificationPopup(err.message || 'Could not load order details.', 'error');
    } finally {
      setLoading(false);
    }
  }, [orderId, showNotificationPopup]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusInfo = (status) => {
    // ... (existing helper function remains the same)
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

  // --- INVOICE GENERATION LOGIC ---
  const handleGenerateInvoice = () => {
    setIsGeneratingInvoice(true);

    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice #${order._id.slice(-8).toUpperCase()}</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
              .invoice-container { max-width: 800px; margin: 20px auto; background: #fff; border: 1px solid #dee2e6; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 30px; border-bottom: 2px solid #dee2e6; }
              .invoice-logo img { max-width: 150px; }
              .invoice-details { text-align: right; }
              .invoice-details h1 { margin: 0; font-size: 24px; color: #343a40; }
              .invoice-details p { margin: 2px 0; color: #6c757d; font-size: 14px; }
              .invoice-addresses { display: flex; justify-content: space-between; padding: 30px; }
              .address-block { width: 48%; }
              .address-block h3 { margin: 0 0 10px; font-size: 14px; color: #495057; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .address-block p { margin: 2px 0; font-size: 14px; line-height: 1.6; color: #6c757d; }
              .invoice-table { width: 100%; border-collapse: collapse; }
              .invoice-table th, .invoice-table td { padding: 12px 30px; text-align: left; }
              .invoice-table thead { background-color: #f8f9fa; border-bottom: 2px solid #dee2e6; }
              .invoice-table th { font-size: 13px; font-weight: 600; color: #495057; text-transform: uppercase; }
              .invoice-table tbody tr { border-bottom: 1px solid #eee; }
              .invoice-table tbody tr:last-child { border-bottom: none; }
              .invoice-table .item-name { font-weight: 600; color: #343a40; }
              .invoice-table .item-meta { font-size: 12px; color: #888; }
              .invoice-totals { padding: 30px; border-top: 2px solid #dee2e6; }
              .totals-table { float: right; width: 40%; }
              .totals-table td { padding: 6px 0; font-size: 14px; }
              .totals-table .label { color: #6c757d; }
              .totals-table .amount { text-align: right; font-weight: 600; color: #343a40; }
              .totals-table tr.grand-total td { font-size: 18px; padding-top: 10px; border-top: 2px solid #343a40; }
              .invoice-footer { padding: 30px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }
              .print-button-container { text-align: center; padding: 20px; }
              @media print {
                  body { background-color: #fff; }
                  .invoice-container { margin: 0; box-shadow: none; border: none; border-radius: 0; }
                  .print-button-container { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="print-button-container">
              <button onclick="window.print()">Print Invoice</button>
          </div>
          <div class="invoice-container">
              <div class="invoice-header">
                  <div class="invoice-logo">
                      <img src="/assets/images/logo.png" alt="Timeless Tribe Co.">
                  </div>
                  <div class="invoice-details">
                      <h1>INVOICE</h1>
                      <p>Invoice #: ${order._id.slice(-8).toUpperCase()}</p>
                      <p>Order Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
              </div>
              <div class="invoice-addresses">
                  <div class="address-block">
                      <h3>Billed To:</h3>
                      <p><strong>${order.shippingAddress.fullName}</strong></p>
                      <p>${order.shippingAddress.street}, ${order.shippingAddress.area}</p>
                      <p>${order.shippingAddress.city}, Nepal</p>
                      <p>Phone: ${order.shippingAddress.phone}</p>
                  </div>
                  <div class="address-block" style="text-align: right;">
                      <h3>Shipped From:</h3>
                      <p><strong>Timeless Tribe Co.</strong></p>
                      <p>123 Artisan Path, Thamel</p>
                      <p>Kathmandu, Nepal</p>
                      <p>support@timelesstribe.com</p>
                  </div>
              </div>
              <table class="invoice-table">
                  <thead>
                      <tr>
                          <th>Item</th>
                          <th style="text-align: center;">Qty</th>
                          <th style="text-align: right;">Price</th>
                          <th style="text-align: right;">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${order.orderItems.map(item => `
                          <tr>
                              <td>
                                  <div class="item-name">${item.name}</div>
                                  <div class="item-meta">${item.variantName} / ${item.size}</div>
                              </td>
                              <td style="text-align: center;">${item.quantity}</td>
                              <td style="text-align: right;">Rs. ${item.price.toLocaleString()}</td>
                              <td style="text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
              <div class="invoice-totals">
                  <table class="totals-table">
                      <tbody>
                          <tr>
                              <td class="label">Subtotal (MRP)</td>
                              <td class="amount">Rs. ${(order.itemsPrice + order.discountOnMRP).toLocaleString()}</td>
                          </tr>
                          ${order.discountOnMRP > 0 ? `
                          <tr>
                              <td class="label">Product Discounts</td>
                              <td class="amount">- Rs. ${order.discountOnMRP.toLocaleString()}</td>
                          </tr>
                          ` : ''}
                          ${order.couponDiscount > 0 ? `
                          <tr>
                              <td class="label">Coupon (${order.couponCode})</td>
                              <td class="amount">- Rs. ${order.couponDiscount.toLocaleString()}</td>
                          </tr>
                          ` : ''}
                          <tr>
                              <td class="label">Shipping Fee</td>
                              <td class="amount">${order.shippingPrice > 0 ? `Rs. ${order.shippingPrice.toLocaleString()}` : 'Free'}</td>
                          </tr>
                          <tr class="grand-total">
                              <td class="label">TOTAL</td>
                              <td class="amount">Rs. ${order.totalPrice.toLocaleString()}</td>
                          </tr>
                      </tbody>
                  </table>
                  <div style="clear: both;"></div>
              </div>
              <div class="invoice-footer">
                  <p>Payment Method: ${order.paymentMethod.toUpperCase()}</p>
                  <p>Thank you for your purchase!</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const newWindow = window.open();
    newWindow.document.write(invoiceHTML);
    newWindow.document.close();

    // Give a slight delay for the content to render before printing
    setTimeout(() => {
        newWindow.print();
        setIsGeneratingInvoice(false);
    }, 500);
  };
  // --- END INVOICE LOGIC ---


  const handleCancelOrder = () => setShowCancelConfirm(true);
  const executeCancelOrder = async () => {
    // ... (existing function)
      setShowCancelConfirm(false);
    setIsCancelling(true);
    try {
      const response = await orderAPI.cancelOrder(orderId);
      setOrder(response.order); // Update order state with the cancelled one
      showNotificationPopup('Order cancelled successfully.', 'success');
    } catch (err) {
      showNotificationPopup(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };
  const handleBuyAgain = async (item) => {
    // ... (existing function)
     if (!user) {
        showLoginModal(true);
        return;
      }
    const cartItemData = {
      productId: item.product,
      variantName: item.variantName,
      size: item.size,
      quantity: item.quantity,
    };
    const result = await addToCart(cartItemData);
    if (result.success) {
      showNotificationPopup(`${item.name} added back to cart!`, 'success');
    } else {
      showNotificationPopup(result.message || 'Could not add item to cart.', 'error');
    }
  };
  const handleWriteReview = (slug) => navigate(`/product/${slug}#reviews-section`);

  const getEstimatedDeliveryDate = () => {
    // ... (existing function)
      if(order?.deliveredAt) return new Date(order.deliveredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      if(order?.createdAt) {
          const createdDate = new Date(order.createdAt);
          const minDate = new Date(createdDate.setDate(createdDate.getDate() + 5));
          const maxDate = new Date(createdDate.setDate(createdDate.getDate() + 2)); 
           return `${minDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${maxDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      }
      return 'Calculating...';
  };

  if (loading) return <LoadingPopup message="Loading Order Details..." />;
  if (error) return <div className="order-detail-error">{error}</div>;
  if (!order) return <div className="order-detail-error">Order not found.</div>;

  const statusInfo = getStatusInfo(order.orderStatus);
  const isCancellable = ['processing', 'pending_payment'].includes(order.orderStatus);

  return (
    <div className="order-detail-page">
      {/* ... (keep popups and modals as they are) ... */}
      {notification.show && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}
      {showCancelConfirm && (
        <ConfirmPopup
          message="Are you sure you want to cancel this order?"
          onConfirm={executeCancelOrder}
          onCancel={() => setShowCancelConfirm(false)}
        />
      )}
      {isCancelling && <LoadingPopup message="Cancelling Order..." />}

      <nav className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/profile?section=orders-section">My Orders</Link> / <span>Order #{order._id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="order-detail-header">
        <h1>Order Details</h1>
        <div className="header-actions">
          <div className={`order-detail-status-tag ${statusInfo.colorClass}`}>
            <i className={statusInfo.icon}></i> {statusInfo.text}
          </div>
          {isCancellable && (
             <button 
                className="cta-button-outline cancel-order-btn" 
                onClick={handleCancelOrder}
                disabled={isCancelling}
             >
                 {isCancelling ? 'Cancelling...' : 'Cancel Order'}
             </button>
           )}
        </div>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-left">
          {/* ... (Shipping Details) ... */}
           <div className="detail-section shipping-details">
            <h3>Shipping Address</h3>
            <p><strong>{order.shippingAddress.fullName}</strong></p>
            <p>{order.shippingAddress.street}, {order.shippingAddress.area}</p>
            <p>{order.shippingAddress.city}, Nepal</p>
            <p>Phone: {order.shippingAddress.phone}</p>
             <div className="delivery-estimate">
                <i className="fa-solid fa-truck-fast"></i> 
                {order.orderStatus === 'delivered' ? `Delivered on: ${getEstimatedDeliveryDate()}` : `Estimated Delivery: ${getEstimatedDeliveryDate()}`}
             </div>
             {order.orderStatus === 'shipped' && order.trackingLink && (
                 <a href={order.trackingLink} target="_blank" rel="noopener noreferrer" className="track-package-link">
                     Track Package <i className="fa-solid fa-external-link-alt"></i>
                 </a>
             )}
          </div>

          <div className="detail-section payment-details">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase() || 'N/A'}</p>
            <p><strong>Payment Status:</strong> <span className={`payment-status ${order.paymentStatus}`}>{order.paymentStatus}</span></p>
             {order.paidAt && <p><strong>Paid On:</strong> {new Date(order.paidAt).toLocaleString()}</p>}
             
             {/* --- MODIFIED INVOICE BUTTON --- */}
             <button 
                className="cta-button-outline download-invoice-btn"
                onClick={handleGenerateInvoice}
                disabled={isGeneratingInvoice}
             >
                {isGeneratingInvoice ? 'Generating...' : 'Download Invoice'}
             </button>
             {/* --- END MODIFICATION --- */}
          </div>
        </div>

        <div className="order-detail-right">
          {/* ... (Items Ordered and Price Summary) ... */}
           <div className="detail-section items-ordered">
            <h3>Items in this Order ({order.orderItems.length})</h3>
            {order.orderItems.map((item, index) => (
              <div key={index} className="order-item-detail-card">
                <Link to={`/product/${item.slug}`} className="item-image-link">
                  <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
                </Link>
                <div className="item-info">
                  <Link to={`/product/${item.slug}`} className="item-name">{item.name}</Link>
                  <p className="item-variant-size">
                    {item.variantName} {item.size !== 'Free Size' ? ` / ${item.size}` : ''}
                  </p>
                  <p className="item-qty">Qty: {item.quantity}</p>
                   <div className="item-pricing">
                       <span className="current-price">Rs. {item.price.toLocaleString()}</span>
                       {item.originalPrice > item.price && (
                           <span className="original-price">Rs. {item.originalPrice.toLocaleString()}</span>
                       )}
                   </div>
                </div>
                 <div className="item-actions">
                    {order.orderStatus === 'delivered' && (
                       <button className="action-link review-link" onClick={() => handleWriteReview(item.slug)}>
                           Write Review
                       </button>
                    )}
                   <button className="action-link buy-again-link" onClick={() => handleBuyAgain(item)}>
                      Buy Again
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="detail-section price-summary">
            <h3>Price Summary</h3>
             <div className="summary-row"><span>Subtotal (MRP)</span><span>Rs. {(order.itemsPrice + order.discountOnMRP).toLocaleString()}</span></div>
             {order.discountOnMRP > 0 && <div className="summary-row discount"><span>Product Discounts</span><span>- Rs. {order.discountOnMRP.toLocaleString()}</span></div>}
             <div className="summary-row subtotal"><span>Subtotal after Discounts</span><span>Rs. {order.itemsPrice.toLocaleString()}</span></div>
             {order.couponDiscount > 0 && <div className="summary-row discount coupon"><span>Coupon ({order.couponCode})</span><span>- Rs. {order.couponDiscount.toLocaleString()}</span></div>}
             <div className="summary-row"><span>Shipping Fee</span><span>{order.shippingPrice === 0 ? <span className="free-shipping">FREE</span> : `Rs. ${order.shippingPrice.toLocaleString()}`}</span></div>
             <hr className="summary-divider"/>
             <div className="summary-row total"><span>Total Amount Paid</span><span>Rs. {order.totalPrice.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
