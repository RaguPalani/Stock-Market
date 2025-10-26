import React, { useEffect, useState } from 'react';
import './success-popup.css';

const SuccessPopup = ({ message, isVisible, onClose, type = 'success', autoClose = true, duration = 3000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(onClose, 500); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, onClose, autoClose, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 500); // Wait for exit animation
  };

  if (!isVisible && !show) return null;

  return (
    <div className={`success-popup-container ${show ? 'popup-enter-active' : 'popup-exit-active'} ${!isVisible ? 'popup-exit' : ''}`}>
      <div className={`success-popup ${type} ${autoClose ? 'with-progress' : 'with-close'}`}>
        <div className="success-icon">
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        
        <span className="success-message">{message}</span>
        
        {!autoClose && (
          <button 
            onClick={handleClose}
            className="close-button"
            aria-label="Close notification"
          >
            <svg className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {autoClose && <div className="progress-bar"></div>}
      </div>
    </div>
  );
};

export default SuccessPopup;