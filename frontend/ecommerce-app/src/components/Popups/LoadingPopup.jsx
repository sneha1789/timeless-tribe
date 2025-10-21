import React from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';

const LoadingPopup = ({ message }) => {
  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-content loading">
        {/* ONLY ONE SPINNER */}
        <div className="loading-spinner-themed"></div>
        <p>{message || 'Processing...'}</p>
      </div>
    </div>,
    document.getElementById('modal-portal')
  );
};

export default LoadingPopup;