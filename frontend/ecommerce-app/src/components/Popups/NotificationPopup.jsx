import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';

const NotificationPopup = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  // Step 1: Assign all the JSX for the popup to a constant named 'popupJsx'
  const popupJsx = (
    <div className="popup-overlay" onClick={onClose}>
      <div className={`popup-content ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="popup-icon">
          {type === 'success' ? (
            <i className="fas fa-check"></i>
          ) : type === 'error' ? (
            <i className="fas fa-times"></i>
          ) : (
            <i className="fas fa-info"></i>
          )}
        </div>
        <p>{message}</p>
      </div>
    </div>
  );

  // Step 2: Use that constant in the SINGLE return statement with the portal
  return ReactDOM.createPortal(
    popupJsx,
    document.getElementById('notification-portal')
  );
};

export default NotificationPopup;