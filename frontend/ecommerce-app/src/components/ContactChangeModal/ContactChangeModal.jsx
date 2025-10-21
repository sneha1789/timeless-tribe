import React, { useState } from 'react';
import { authAPI } from '../../services/authAPI';
import './ContactChangeModal.css';

const ContactChangeModal = ({ type, isOpen, onClose, onSuccess }) => {
  const [stage, setStage] = useState('request'); // 'request' or 'verify'
  const [newValue, setNewValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.requestContactChange({ type, value: newValue });
      setStage('verify');
    } catch (err) {
      setError(err.message || `Failed to send OTP to new ${type}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyContactChange({ token: otp });
      onSuccess(response.user); // Pass the updated user back to the Profile page
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="contact-change-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        {stage === 'request' ? (
          <>
            <h2>Change Your {type}</h2>
            <p>Enter your new {type} below. We'll send a verification code to it.</p>
            <form onSubmit={handleRequestOTP}>
              <input
                type={type === 'email' ? 'email' : 'tel'}
                placeholder={`Enter new ${type}`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                required
              />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Verify Your New {type}</h2>
            <p>An OTP has been sent to <strong>{newValue}</strong>. Please enter it below.</p>
            <form onSubmit={handleVerifyOTP}>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="6"
              />
              {error && <p className="error-text">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Update'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactChangeModal;