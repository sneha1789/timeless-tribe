import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './OrderSuccess.css';
import LoadingPopup from '../../components/Popups/LoadingPopup';

const AnimatedCheckmark = () => (
  <div className="checkmark-container">
    <svg
      className="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
    >
      <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
      <path
        className="checkmark-check"
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
    </svg>
  </div>
);

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user, clearCartFrontend, fetchCart } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [isCod, setIsCod] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const getEstimatedDeliveryDate = () => {
    const formatDate = (date) =>
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  useEffect(() => {
    const processOrder = async () => {
      console.log(
        'OrderSuccess page loaded. URL search params:',
        searchParams.toString(),
      );

      const esewaData = searchParams.get('data');
      const codOrderId = searchParams.get('orderId');
      const isCodOrder = searchParams.get('cod') === 'true';

      if (esewaData) {
        console.log('Found eSewa data. Attempting backend verification...');
        setIsLoading(true);
        try {
          const decodedData = JSON.parse(atob(esewaData));
          console.log('Decoded eSewa Data:', decodedData);

          if (decodedData.status !== 'COMPLETE') {
            throw new Error(
              `Payment was not completed. Status: ${decodedData.status}`,
            );
          }

          console.log('Sending verification request to backend...');

          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/orders/verify-esewa-payment`,
            { decodedData },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          );
          console.log('Backend verification successful.');

          const transactionUuid = decodedData.transaction_uuid;
          setOrderId(transactionUuid);

          console.log('Syncing frontend cart...');
          clearCartFrontend();
          fetchCart();

          const orderResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/orders/${transactionUuid}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          );
          setOrderDetails(orderResponse.data);
          setIsLoading(false);
        } catch (err) {
          console.error('Error processing success page:', err);
          if (err.response) {
            console.error('Response error:', err.response.data);
            console.error('Status:', err.response.status);
          }
          setError(
            err.response?.data?.message ||
              err.message ||
              'There was a problem verifying your order.',
          );
          setIsLoading(false);
        }
      } else if (isCodOrder && codOrderId) {
        console.log('Found COD data. Processing as COD order...');
        setOrderId(codOrderId);
        setIsCod(true);

        clearCartFrontend();
        fetchCart();

        try {
          const orderResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/orders/${codOrderId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            },
          );
          setOrderDetails(orderResponse.data);
        } catch (err) {
          console.error('Error fetching order details:', err);

          setOrderDetails({
            _id: codOrderId,
            paymentMethod: 'COD',
            shippingAddress: {
              fullName: 'Loading...',
              street: '',
              area: '',
              city: '',
            },
          });
        }
        setIsLoading(false);
      } else {
        console.log('No valid eSewa or COD parameters found in URL.');
        setError('No valid order information found.');
        setIsLoading(false);
      }
    };

    processOrder();
  }, [searchParams, clearCartFrontend, fetchCart]);

  if (isLoading) {
    return <LoadingPopup message="Finalizing your order, please wait..." />;
  }

  if (error) {
    return (
      <div className="order-result-container error">
        <div className="result-icon">
          <i className="fa-solid fa-times-circle"></i>
        </div>
        <h2>Order Processing Failed</h2>
        <p>{error}</p>
        {orderId && (
          <p className="order-id-display">Order ID: #{orderId.slice(-8)}</p>
        )}
        <div className="result-actions">
          <Link to="/contact" className="cta-button-outline">
            Contact Support
          </Link>
          <Link to="/" className="cta-button">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="success-card">
        <AnimatedCheckmark />
        <h2 className="success-headline">
          Thank you{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Your
          order is confirmed.
        </h2>
        <p className="success-subheadline">
          {user?.email ? (
            <>
              An order confirmation has been sent to{' '}
              <strong>{user.email}</strong>.
            </>
          ) : (
            'Your order has been successfully placed.'
          )}
        </p>

        <div className="order-timeline">
          <div className="timeline-step active">
            <div className="timeline-dot"></div>
            <div className="timeline-label">Order Placed</div>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-label">Processing</div>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-label">Shipped</div>
          </div>
          <div className="timeline-line"></div>
          <div className="timeline-step">
            <div className="timeline-dot"></div>
            <div className="timeline-label">Delivered</div>
          </div>
        </div>

        <div className="order-details-grid">
          <div className="detail-item">
            <h4 className="detail-title">Order ID</h4>
            <p className="detail-content">
              #{orderId?.slice(-12) || orderDetails?._id?.slice(-12)}
            </p>
          </div>
          <div className="detail-item">
            <h4 className="detail-title">Estimated Delivery</h4>
            <p className="detail-content">{getEstimatedDeliveryDate()}</p>
          </div>
          <div className="detail-item">
            <h4 className="detail-title">Payment Method</h4>
            <p className="detail-content">
              {isCod
                ? 'Cash on Delivery'
                : `Paid via ${orderDetails?.paymentMethod || 'eSewa'}`}
            </p>
          </div>
          <div className="detail-item shipping-address">
            <h4 className="detail-title">Shipping To</h4>
            <p className="detail-content">
              <strong>
                {orderDetails?.shippingAddress?.fullName || 'Loading...'}
              </strong>
              <br />
              {orderDetails?.shippingAddress?.street && (
                <>
                  {orderDetails.shippingAddress.street},{' '}
                  {orderDetails.shippingAddress.area},{' '}
                  {orderDetails.shippingAddress.city}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/profile?section=orders-section" className="cta-button"> {/* Verify this link */}
  TRACK MY ORDER
</Link>
          <Link to="/#categories" className="cta-button-outline">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
