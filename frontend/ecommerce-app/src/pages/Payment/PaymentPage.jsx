import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LoadingPopup from '../../components/Popups/LoadingPopup';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import { useAuth } from '../../context/AuthContext';
import './PaymentPage.css';

const postToGateway = (url, data) => {
  console.log('Posting to gateway:', url, data);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = data[key];
      form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  form.submit();
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const orderIdFromState = location.state?.orderId;

  const [orderDetails, setOrderDetails] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

   const [loadingText, setLoadingText] = useState('');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderIdFromState) {
        console.error('PaymentPage: Order ID missing from location state.');
        setFetchError('Order details are missing. Redirecting back to cart...');
        const timer = setTimeout(() => navigate('/checkout'), 2500);
        setFetchingOrder(false);
        return () => clearTimeout(timer);
      }

      console.log(`PaymentPage: Fetching order details for ID: ${orderIdFromState}`);
      setFetchingOrder(true);
      setFetchError('');
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/orders/${orderIdFromState}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          },
        );
        console.log('PaymentPage: Order details fetched:', response.data);
        setOrderDetails(response.data);
      } catch (error) {
        console.error(
          'PaymentPage: Failed to fetch order details:',
          error.response?.data || error.message,
        );

        setFetchError(
          error.response?.data?.message ||
            'Could not load order details. Redirecting back to cart...',
        );

        const timer = setTimeout(() => {
          navigate('/checkout');
        }, 3000);

        return () => clearTimeout(timer);
      } finally {
        setFetchingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [orderIdFromState, navigate]);

  const handlePaymentInitiation = async (paymentMethod) => {
    if (!orderDetails || !user) {
      showNotification('Order details missing or user not logged in.', 'error');
      navigate('/checkout');
      return;
    }

    setSelectedMethod(paymentMethod);
     if (paymentMethod === 'COD') {
        setLoadingText('Finalizing your order...');
    } else {
        setLoadingText(`Redirecting to ${paymentMethod}...`);
    }
    setIsProcessingPayment(true);
    setNotification({ message: '', type: '' });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/orders/${orderDetails._id}/initiate-payment`,
        { paymentMethod },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        },
      );
      const paymentData = response.data;

      if (paymentMethod === 'COD' && paymentData.cod) {
        console.log('COD confirmed by backend.');
        navigate(`/order-success?orderId=${orderDetails._id}&cod=true`);
      } else if (
        paymentMethod === 'eSewa' &&
        paymentData.paymentGateway === 'eSewa'
      ) {
        console.log('Received eSewa data, preparing form post...');
        postToGateway(paymentData.paymentUrl, paymentData.formData);
      } else {
        console.error('Unexpected payment response:', paymentData);
        throw new Error(
          'Unexpected payment gateway response or method mismatch.',
        );
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      showNotification(
        error.response?.data?.message || 'Failed to start payment process.',
        'error',
      );
      setIsProcessingPayment(false);
      setSelectedMethod('');
    }
  };

  const getEstimatedDeliveryDate = () => {
    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  if (fetchingOrder) {
    return (
      <div className="payment-page-container loading-state">
        <LoadingPopup message="Loading Order Details..." />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="payment-page-container loading-state">
        {notification.message && (
          <NotificationPopup
            message={notification.message || fetchError}
            type={notification.type || 'error'}
            onClose={() => setNotification({ message: '', type: '' })}
          />
        )}
        <LoadingPopup message={fetchError || 'Loading...'} />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="payment-page-container loading-state">
        <p>Could not load order details.</p>
        <Link to="/checkout">Back to Cart</Link>
      </div>
    );
  }

  return (
    <div className="payment-page-container">
      {isProcessingPayment && (
        <LoadingPopup message={`Processing ${selectedMethod}...`} />
      )}
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}

      <div className="payment-content-wrapper">
        <div className="checkout-progress-bar">
          <div className="progress-step completed">
            <Link to="/checkout" className="step-link">
              <span className="step-number">
                <i className="fa-solid fa-check"></i>
              </span>
              Cart
            </Link>
          </div>
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <span className="step-number">2</span>
            Payment
          </div>
        </div>

        <div className="payment-layout">
          {/* Left Column: Address and Payment */}
          <div className="payment-main-column">
            
            {/* Delivery Address Section */}
            <div className="payment-section delivery-address-section">
              <div className="section-header">
                <h3>Shipping To:</h3>
                <Link to="/checkout" className="change-address-btn">Change</Link>
              </div>
              <div className="address-card">
                <strong>{orderDetails.shippingAddress.fullName}</strong>
                <p>{orderDetails.shippingAddress.street}, {orderDetails.shippingAddress.area}, {orderDetails.shippingAddress.city}</p>
                <p>Phone: {orderDetails.shippingAddress.phone}</p>
              </div>
              
              {/* Estimated Delivery Section */}
              <div className="estimated-delivery">
                <i className="fa-solid fa-truck-fast"></i>
                <span>Estimated delivery by <strong>{getEstimatedDeliveryDate()}</strong></span>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="payment-section payment-options-section">
              <div className="section-header">
                <h3>Choose Payment Method</h3>
              </div>
              <div className="payment-options">
                <button
                  className={`payment-option-btn esewa ${
                    selectedMethod === 'eSewa' ? 'selected' : ''
                  }`}
                  onClick={() => handlePaymentInitiation('eSewa')}
                  disabled={isProcessingPayment}
                >
                  <img
                    src="/assets/images/esewa.jpg"
                    alt="eSewa Logo"
                    className="payment-logo"
                  />
                  <span>Pay with eSewa</span>
                  {isProcessingPayment && selectedMethod === 'eSewa' && (
                    <div className="button-spinner"></div>
                  )}
                </button>

                <button
                  className={`payment-option-btn cod ${
                    selectedMethod === 'COD' ? 'selected' : ''
                  }`}
                  onClick={() => handlePaymentInitiation('COD')}
                  disabled={isProcessingPayment}
                >
                  <i className="fa-solid fa-money-bill-wave payment-logo icon"></i>
                  <span>Cash on Delivery</span>
                  {isProcessingPayment && selectedMethod === 'COD' && (
                    <div className="button-spinner"></div>
                  )}
                </button>
              </div>
              
              {/* Enhanced Security Info */}
              <div className="payment-footer-note">
                <p>
                  <i className="fa-solid fa-shield-halved"></i> 100% Secure & Encrypted Transactions
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="order-summary-column">
            <div className="payment-section order-summary-section">
              {/* Collapsible Header for Mobile */}
              <div className="summary-header" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                <h3>Order Summary</h3>
                <div className="summary-total-preview">
                  <span>Rs. {orderDetails.totalPrice.toLocaleString()}</span>
                  <i className={`fa-solid fa-chevron-down ${isSummaryExpanded ? 'rotated' : ''}`}></i>
                </div>
              </div>

              {/* Collapsible Details Container */}
              <div className={`order-summary-details ${isSummaryExpanded ? 'expanded' : ''}`}>
                <div className="summary-row">
                  <span>Items Total (MRP)</span>
                  <span>
                    Rs. {(orderDetails.itemsPrice + orderDetails.discountOnMRP).toLocaleString()}
                  </span>
                </div>
                {orderDetails.discountOnMRP > 0 && (
                  <div className="summary-row discount">
                    <span>Product Discounts</span>
                    <span>- Rs. {orderDetails.discountOnMRP.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row subtotal">
                  <span>Subtotal</span>
                  <span>Rs. {orderDetails.itemsPrice.toLocaleString()}</span>
                </div>
                {orderDetails.couponDiscount > 0 && (
                  <div className="summary-row discount coupon">
                    <span>Coupon ({orderDetails.couponCode})</span>
                    <span>- Rs. {orderDetails.couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  {orderDetails.shippingPrice === 0 ? (
                    <span className="free-shipping">FREE</span>
                  ) : (
                    <span>Rs. {orderDetails.shippingPrice.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Always Visible Total */}
              <hr className="summary-divider" />
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>Rs. {orderDetails.totalPrice.toLocaleString()}</span>
              </div>
              {orderDetails.discountOnMRP + orderDetails.couponDiscount > 0 && (
                <div className="summary-savings success">
                  You saved Rs. {(
                    orderDetails.discountOnMRP + orderDetails.couponDiscount
                  ).toLocaleString()} on this order!
                </div>
              )}
            </div>

            <div className="payment-section order-items-summary-preview">
              <h4>Items in Order ({orderDetails.orderItems.length})</h4>

              {orderDetails.orderItems.slice(0, 2).map((item) => (
                <div
                  key={item.product + item.variantName + item.size}
                  className="item-preview"
                >
                  <img
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="item-preview-details">
                    <span className="item-preview-name">{item.name}</span>
                    <span className="item-preview-variant">
                      {item.variantName}
                      {item.size !== 'Free Size' ? `, ${item.size}` : ''}
                    </span>
                    <span className="item-preview-qty">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="item-preview-price">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              {orderDetails.orderItems.length > 2 && (
                <p className="more-items-indicator">
                  + {orderDetails.orderItems.length - 2} more item(s)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;