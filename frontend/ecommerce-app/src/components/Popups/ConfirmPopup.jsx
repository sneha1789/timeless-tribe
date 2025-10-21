import React from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-content confirm">
        <p>{message}</p>
        <div className="popup-actions">
          <button onClick={onConfirm} className="popup-btn confirm-yes">
            Yes
          </button>
          <button onClick={onCancel} className="popup-btn confirm-no">
            No
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-portal'),
  );
};

export default ConfirmPopup;
