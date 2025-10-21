import React, { useEffect } from 'react';

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Initialize Google Identity Services after script loads
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      // Render button
      window.google.accounts.id.renderButton(
        document.getElementById('googleLoginButton'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          logo_alignment: 'left',
        }
      );
    }
  }, []);

  const handleGoogleResponse = (response) => {
    if (response.credential) {
      onSuccess(response.credential);
    } else {
      onFailure(response);
    }
  };

  const handleClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="google-login-container">
      <div 
        id="googleLoginButton"
        style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center'
        }}
      ></div>
    </div>
  );
};

export default GoogleLoginButton;