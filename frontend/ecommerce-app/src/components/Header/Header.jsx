import React, { useState, useEffect, useRef } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/authAPI';
import GoogleLoginButton from '../GoogleLoginButton';
import NotificationPopup from '../Popups/NotificationPopup';
import ConfirmPopup from '../Popups/ConfirmPopup';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../../context/AuthContext';
import WishlistModal from '../WishlistModal/WishlistModal';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  connectSearchBox, 
  connectHits,    
  connectStateResults,
} from 'react-instantsearch-dom';
import './Header.css';

const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID;
const SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_ONLY_KEY;
const searchClient = APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;

// --- 1. THE NEW, STYLED SEARCH BAR COMPONENT ---
const CustomSearchBox = ({ currentRefinement, refine, onSearch, onFocus, onBlur }) => {
  return (
    // Pass the currentRefinement (the query) directly to the onSearch handler
    <form className="search-container" onSubmit={(e) => onSearch(e, currentRefinement)} noValidate> 
      <input
        type="search"
        className="search-input"
        placeholder="Search for handicrafts, jewel..."
        value={currentRefinement}
        onChange={event => refine(event.currentTarget.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button type="submit" className="search-icon-button" aria-label="Search">
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
      </button>
    </form>
  );
};
const ConnectedSearchBox = connectSearchBox(CustomSearchBox);


// --- 2. THE NEW, STYLED HITS (RESULTS) COMPONENT ---
const CustomHits = connectHits(({ hits }) => (
    <div className="search-dropdown-results">
        {hits.length > 0 && <h4 className="dropdown-section-title">Products</h4>}
        {hits.map(hit => (
            <Link to={`/product/${hit.slug}`} key={hit.objectID} className="product-hit">
                <img src={hit.image} alt={hit.name} className="hit-image" />
                <div className="hit-info">
                    <span className="hit-name">{hit.name}</span>
                    <span className="hit-price">Rs. {hit.price.toLocaleString()}</span>
                </div>
            </Link>
        ))}
    </div>
));


// --- 3. WRAPPER TO CONTROL DROPDOWN VISIBILITY ---
const InstantSearchWrapper = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchContainerRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchContainerRef]);
    
    // The component that decides whether to show the dropdown
    const Dropdown = connectStateResults(({ searchResults }) => {
        const hasResults = searchResults && searchResults.nbHits > 0;
        const hasQuery = searchResults && searchResults.query; // Check if the user has typed anything
        return (
            // --- THIS IS THE FIX ---
            // Only show the dropdown if the input is focused, there are results, AND there's a query.
            <div className={`search-dropdown ${isDropdownOpen && hasResults && hasQuery ? 'open' : ''}`}>
                <CustomHits />
            </div>
        );
    });

    // Handle final search submission (on Enter press)
    const handleSearch = (event, query) => {
        event.preventDefault();
        if (query.trim()) {
            setIsDropdownOpen(false); // <-- This closes the dropdown
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };
    
    if (!searchClient) return null;

    return (
        <div className="header-search" ref={searchContainerRef}>
            <InstantSearch
                searchClient={searchClient}
                indexName="products"
            >
                <ConnectedSearchBox 
  onSearch={handleSearch}
  onFocus={() => setIsDropdownOpen(true)}
/>
                <Dropdown />
            </InstantSearch>
        </div>
    );
};


const Header = () => {
  const {
    user,
    setUser,
    authLoading,
    showLoginModal,
    setShowLoginModal,
    wishlist,
    setWishlist,
    cart,
    removeFromCart,
    updateCartQuantity,
    addToCart,
  } = useAuth();

  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [isPhoneSignup, setIsPhoneSignup] = useState(false);
  const [otpVerificationStatus, setOtpVerificationStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoginLoading, setGoogleLoginLoading] = useState(false);
  const [googleSignupLoading, setGoogleSignupLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });
  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    message: '',
    onConfirm: null,
  });
  const [recaptchaError, setRecaptchaError] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordStage, setForgotPasswordStage] = useState('request');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [isPhoneReset, setIsPhoneReset] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetStage, setResetStage] = useState('choose'); // Stages: 'choose', 'verify', 'reset'
  const [resetMethod, setResetMethod] = useState(''); // 'email' or 'mobile'
  const [resetForm, setResetForm] = useState({
    otp: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(null); // true, false, or null
   const [headerSearchQuery, setHeaderSearchQuery] = useState('');
    const [modalSearchQuery, setModalSearchQuery] = useState('');
      const [showSearchDropdown, setShowSearchDropdown] = useState(false);
     // --- 2. Get the current location ---
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  const showNotificationPopup = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleScrollToCategories = (e) => {
    e.preventDefault();
    
    // Check if we are already on the homepage
    if (location.pathname === '/') {
        // If so, just find the element and scroll smoothly to it
        const categoriesSection = document.getElementById('categories');
        if (categoriesSection) {
            categoriesSection.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // If we are on a different page, navigate to the homepage first
        navigate('/');
        
        // Use a short delay to give the homepage time to render before we scroll
        setTimeout(() => {
            const categoriesSection = document.getElementById('categories');
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 150); // 150ms is usually a safe delay
    }
  };

 useEffect(() => {
        const handleScroll = () => {
            // Set scrolled state to true if user scrolls more than 50px down
            setIsScrolled(window.pageYOffset > 50);
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

     const handleSearchSubmit = (query) => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            // Hide dropdown after submitting
            document.activeElement.blur(); 
        }
    };
    

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prevCooldown) => prevCooldown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const logoutMessageData = sessionStorage.getItem('logoutMessage');

    if (logoutMessageData) {
      const { message, type } = JSON.parse(logoutMessageData);

      showNotificationPopup(message, type);

      sessionStorage.removeItem('logoutMessage');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 50);
    };
    const handleClickOutside = (e) => {
      document.querySelectorAll('.has-dropdown').forEach((dropdownParent) => {
        if (!dropdownParent.contains(e.target)) {
          dropdownParent.classList.remove('open');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const logoutMessageData = sessionStorage.getItem('logoutMessage');
    if (logoutMessageData) {
      const { message, type } = JSON.parse(logoutMessageData);
      showNotificationPopup(message, type);
      sessionStorage.removeItem('logoutMessage');
    }
  }, []);

  // Effect for checking password match in the new reset modal
  useEffect(() => {
    if (resetForm.newPassword || resetForm.confirmNewPassword) {
      setPasswordMatch(
        resetForm.newPassword === resetForm.confirmNewPassword &&
          resetForm.newPassword.length > 0,
      );
    } else {
      setPasswordMatch(null);
    }
  }, [resetForm.newPassword, resetForm.confirmNewPassword]);
  // --- End of useEffects ---

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA.');
      return;
    }

    setLoading(true);
    setRecaptchaError('');

    const passwordInput = e.target.elements['login-password']?.value;

    const loginData = isPhoneLogin
      ? { mobile: loginIdentifier, password: passwordInput }
      : { email: loginIdentifier, password: passwordInput };

    loginData.recaptchaToken = recaptchaToken;

    try {
      const response = await authAPI.login(loginData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response); // <-- This sets the user in AuthContext

      // --- SIMPLIFIED LOGIC ---
      setShowLoginModal(false); // Close login modal regardless of verification
      showNotificationPopup('Login successful!', 'success'); // Show success message

      // Optional: Add a notification if verification is needed
      if (
          (!isPhoneLogin && !response.isEmailVerified && response.email) || // Logged in with email, not verified
          (isPhoneLogin && !response.isMobileVerified && response.mobile) // Logged in with mobile, not verified
         ) {
           // Show a *different* notification suggesting profile verification
           setTimeout(() => { // Delay slightly so it appears after login success
               showNotificationPopup('Please verify your contact details in your profile.', 'info');
           }, 2000); // 1 second delay
      }

      // Consider removing the reload or increasing delay if notifications clash
      setTimeout(() => window.location.reload(), 2500); // Increased delay for reload
      // --- END OF SIMPLIFIED LOGIC ---

    } catch (error) {
      if (error.message && error.message.includes('reCAPTCHA')) {
        setRecaptchaError(error.message);
      } else {
        showNotificationPopup(
          error.message || 'Login failed. Please try again.',
          'error',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await authAPI.removeFromWishlist(productId);
      setWishlist(response.wishlist);
    } catch (error) {
      showNotificationPopup(error.message, 'error');
    }
  };

  const handleHeaderSearch = (e) => {
        e.preventDefault();
        const query = headerSearchQuery.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setHeaderSearchQuery(''); // Clear input after search
        }
    };

    // --- NEW: Handler for submitting search from the modal ---
    const handleModalSearch = (e) => {
        e.preventDefault();
        const query = modalSearchQuery.trim();
        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setModalSearchQuery('');
            setShowSearchModal(false); // Close modal after search
        }
    };


  const handleMoveToCart = async (product, variant, size) => {
    const result = await addToCart({
      productId: product._id,
      variantName: variant.name,
      size: size,
      quantity: 1,
    });

    if (result.success) {
      showNotificationPopup(`${product.name} moved to cart!`, 'success');
      await handleRemoveFromWishlist(product._id);
    } else {
      showNotificationPopup(result.message, 'error');
    }
  };

  const handleCartIconClick = () => {
    if (user) {
      navigate('/checkout');
    } else {
      setShowCartModal(true);
    }
  };

  const handleWishlistClick = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowWishlistModal(true);
  };

  const handleGoogleLogin = async (googleToken) => {
    setGoogleLoginLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/google-auth',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: googleToken }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowLoginModal(false);

        showNotificationPopup('Login with Google successful!', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);

      showNotificationPopup(error.message || 'Google login failed.', 'error');
    } finally {
      setGoogleLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setRecaptchaError('Please complete the reCAPTCHA.');
      return;
    }

    setLoading(true);
    setRecaptchaError('');

    const nameInput = e.target.elements['signup-name']?.value;
    const identifierInput = e.target.elements['signup-identifier']?.value;
    const passwordInput = e.target.elements['signup-password']?.value;

    const isPhone = /^[0-9]+$/.test(identifierInput);

    const userData = {
      name: nameInput,
      password: passwordInput,
    };

    if (isPhone) {
      userData.mobile = identifierInput;
    } else {
      userData.email = identifierInput;
    }

    userData.recaptchaToken = recaptchaToken;

    try {
      const response = await authAPI.register(userData);

      localStorage.setItem('token', response.token);
      setOtpData({
        identifier: identifierInput,
        isPhone: isPhone,
        type: 'signup',
        userData: response,
      });
      setShowSignupModal(false);
      setShowOtpModal(true);
    } catch (error) {
      if (error.message && error.message.includes('reCAPTCHA')) {
        setRecaptchaError(error.message);
      } else {
        showNotificationPopup(
          error.message || 'Registration failed. Please try again.',
          'error',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (googleToken) => {
    setGoogleSignupLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/users/google-auth',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: googleToken }),
        },
      );

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowSignupModal(false);
        showNotificationPopup(
          'Signup with Google successful! Welcome!',
          'success',
        );
      } else {
        throw new Error(data.message || 'Google signup failed');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      showNotificationPopup(error.message || 'Google signup failed.', 'error');
    } finally {
      setGoogleSignupLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google login failed:', error);
    showNotificationPopup('Google login failed. Please try again.', 'error');
  };

  const handleGoogleSignupFailure = (error) => {
    console.error('Google signup failed:', error);
    showNotificationPopup('Google signup failed. Please try again.', 'error');
  };

  const handleLoginWithOtpRequest = async () => {
    if (!loginIdentifier) {
      showNotificationPopup('Please enter your mobile number', 'error');
      return;
    }
    setLoading(true);
    try {
      await authAPI.sendLoginOtp(loginIdentifier);

      setShowLoginModal(false);
      setOtpData({
        identifier: loginIdentifier,
        isPhone: true,
        type: 'login-otp',
      });
      setShowOtpModal(true);
      showNotificationPopup('OTP sent successfully!', 'success');
    } catch (error) {
      showNotificationPopup(error.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (!otpInput || otpInput.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpVerificationStatus('verifying');
    setOtpError('');

    try {
      if (otpData?.type === 'login-otp') {
        const response = await authAPI.verifyLoginOtp(
          otpData.identifier,
          otpInput,
        );

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
        setUser(response);

        setShowOtpModal(false);
        setOtpInput('');
        setOtpVerificationStatus('');
        showNotificationPopup('Login successful!', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        let response;
        if (otpData.isPhone) {
          response = await authAPI.verifyMobile(otpData.identifier, otpInput);
        } else {
          response = await authAPI.verifyEmail(otpData.identifier, otpInput);
        }

        localStorage.setItem('token', response.token);
        const userProfile = await authAPI.getProfile();
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);

        setShowOtpModal(false);
        setOtpInput('');
        setOtpVerificationStatus('');

        if (otpData?.type === 'signup') {
          showNotificationPopup('Signup Successful! Welcome!', 'success');
        } else {
          showNotificationPopup('Verification Successful!', 'success');
        }
      }
    } catch (error) {
      setOtpError(error.message || 'Verification failed. Incorrect OTP.');
      setOtpInput('');
      setOtpVerificationStatus('');
    }
  };

  const handleOtpInputChange = (e) => {
    setOtpInput(e.target.value);
    if (otpError) {
      setOtpError('');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      await authAPI.resendOTP(
        otpData.identifier,
        otpData.isPhone ? 'mobile' : 'email',
      );

      showNotificationPopup('New OTP sent successfully!', 'success');

      setResendCooldown(30);
    } catch (error) {
      showNotificationPopup(error.message || 'Failed to resend OTP', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    setConfirmPopup({
      show: true,
      message: 'Are you sure you want to logout?',
      onConfirm: executeLogout,
    });
  };
  const executeLogout = () => {
    setConfirmPopup({ show: false, message: '', onConfirm: null });
    sessionStorage.setItem(
      'logoutMessage',
      JSON.stringify({
        message: 'You have successfully logged out.',
        type: 'success',
      }),
    );
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  const togglePasswordVisibility = (inputId) => {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput) {
      const type =
        passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    }
  };

  const handleCartClick = () => {
    setShowCartModal(true);
    updateCartDisplay();
  };

  const updateCartDisplay = () => {
    console.log('Updating cart display');
  };

  const handleOpenResetModal = () => {
    if (!user) return;
    const hasVerifiedContact =
      (user.isEmailVerified && user.email) ||
      (user.isMobileVerified && user.mobile);

    if (hasVerifiedContact) {
      setResetStage('choose'); // Always start at the 'choose' stage
      setShowResetPasswordModal(true);
    } else {
      showNotificationPopup(
        "You don't have a verified contact method to reset your password.",
        'error',
      );
    }
  };
  const handleChooseResetMethod = async (method) => {
    setLoading(true);
    setResetMethod(method);
    try {
      const response = await authAPI.initiatePasswordReset({ type: method });
      showNotificationPopup(response.message, 'success');
      setResetStage('verify');
      setResendCooldown(30);
    } catch (error) {
      showNotificationPopup(error.message || 'Failed to send OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };
  // NEW: Handler for resending OTP in the reset modal
  const handleResendResetOtp = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const response = await authAPI.initiatePasswordReset({
        type: resetMethod,
      });
      showNotificationPopup(response.message, 'success');
      setResendCooldown(30);
    } catch (error) {
      showNotificationPopup(error.message || 'Failed to resend OTP.', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const handleFinalPasswordReset = async (e) => {
    e.preventDefault();
    if (!passwordMatch) {
      showNotificationPopup('Passwords do not match.', 'error');
      return;
    }
    if (resetForm.newPassword.length < 6) {
      showNotificationPopup(
        'Password must be at least 6 characters long.',
        'error',
      );
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.executePasswordReset({
        token: resetForm.otp,
        newPassword: resetForm.newPassword,
      });

      setShowResetPasswordModal(false);
      showNotificationPopup(response.message, 'success');

      setTimeout(() => {
        setConfirmPopup({
          show: true,
          message:
            'Your session has expired for security. Please log in again with your new password.',
          onConfirm: executeLogout,
        });
      }, 1000);
    } catch (error) {
      // NEW: Handle lockout error
      if (
        error.message &&
        error.message.includes('locked for password changes')
      ) {
        showNotificationPopup(error.message, 'error');
        setShowResetPasswordModal(false); // Close the modal
        navigate('/contact'); // Redirect to contact page
      } else {
        showNotificationPopup(
          error.message || 'Password reset failed.',
          'error',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetFormChange = (e) => {
    setResetForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  useEffect(() => {
    const handleClickOutsideModal = (e) => {
      if (e.target.classList.contains('modal')) {
        setShowLoginModal(false);
        setShowSignupModal(false);
        setShowCartModal(false);
        setShowWishlistModal(false);
        setShowOtpModal(false);
      }
    };

    document.addEventListener('click', handleClickOutsideModal);
    return () => document.removeEventListener('click', handleClickOutsideModal);
  }, []);

  const openForgotPasswordModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setForgotPasswordStage('request');
    setResetIdentifier('');
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isPhoneReset
        ? { mobile: resetIdentifier }
        : { email: resetIdentifier };
      const response = await authAPI.forgotPasswordRequest(data);
      showNotificationPopup(response.message, 'success');
      setForgotPasswordStage('reset');
    } catch (error) {
      showNotificationPopup(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const otp = e.target.elements['otp-input'].value;
    const newPassword = e.target.elements['new-password'].value;

    try {
      const data = isPhoneReset
        ? { mobile: resetIdentifier, token: otp, newPassword }
        : { email: resetIdentifier, token: otp, newPassword };

      const response = await authAPI.resetPassword(data);

      setShowForgotPasswordModal(false);
      showNotificationPopup(response.message, 'success');
      setShowLoginModal(true);
    } catch (error) {
      showNotificationPopup(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link to="/" className="header-brand">
            <img
              src="/assets/images/logo.png"
              alt="Timeless Tribe"
              className="header-logo"
            />
            <div className="brand-text">
              <span className="brand-main">Timeless</span>
              <span className="brand-accent">Tribe Co.</span>
            </div>
          </Link>
  <InstantSearchWrapper />

          <div className="header-actions">

            {/* NEW: Search icon - visible only WHEN scrolled */}
                        {/* NEW: Search icon - visible only WHEN scrolled */}
<button 
    className="action-btn search-action-btn"
    title="Search"
    onClick={() => setShowSearchModal(true)}
>
    <i className="fa-solid fa-magnifying-glass"></i>
</button>
            <button
              className="action-btn"
              id="wishlist-btn"
              title="Wishlist"
              onClick={handleWishlistClick}
            >
              <i className="fa-solid fa-heart"></i>

              {user && (
                <span className="notification-badge">
                  {wishlist ? wishlist.length : 0}
                </span>
              )}
            </button>

            <button
              className="action-btn"
              id="cart-btn"
              title="Cart"
              onClick={handleCartIconClick}
            >
              <i className="fa-solid fa-shopping-bag"></i>

              {user && (
                <span className="notification-badge">{cart.length}</span>
              )}
            </button>
            {authLoading ? (
              <div className="action-btn-placeholder"></div>
            ) : user ? (
              <div
                className="profile-dropdown-container"
                id="profile-container"
              >
                <Link
                  to="/profile"
                  className="action-btn"
                  id="profile-btn"
                  title="My Profile"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="profile-avatar"
                    />
                  ) : (
                    <i className="fa-solid fa-user"></i>
                  )}
                </Link>
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-info">
                    <span className="user-greeting">Hello</span>
                    <span className="user-name" id="dropdown-username">
                      {user.name}
                    </span>
                  </div>
                  <ul>
                   
<li>
  <Link to="/profile?section=orders-section"> {/* Verify this link */}
    <i className="fa-solid fa-box-archive"></i> Orders
  </Link>
</li>
                    <li>
                      <Link to="/profile?section=wishlist-section">
                        <i className="fa-solid fa-heart"></i> Wishlist
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact">
                        <i className="fa-solid fa-headset"></i> Contact Us
                      </Link>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <Link to="/profile?section=details-section">
                        <i className="fa-solid fa-user-pen"></i> Edit Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile?section=addresses-section">
                        <i className="fa-solid fa-location-dot"></i> Saved
                        Addresses
                      </Link>
                    </li>
                    <li>
                      {/* NEW "CHANGE PASSWORD" LINK */}
                      <a href="#" onClick={handleOpenResetModal}>
                        <i className="fa-solid fa-key"></i> Change Password
                      </a>
                    </li>
                  </ul>
                  <ul>
                    <li>
                      <a href="#" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>{' '}
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <button
                className="login-btn"
                id="login-btn"
                onClick={() => setShowLoginModal(true)}
              >
                Login
              </button>
            )}
          </div>
        </div>

        <nav className="header-nav">
          <div className="nav-container">
            <ul className="nav-menu">
              <li>
                <Link to="/" className="nav-link scroll-link">
                  HOME
                </Link>
              </li>
              <li>
                <a href="/#categories" className="nav-link" onClick={handleScrollToCategories}>
                  CATEGORIES
                </a>
              </li>
              <li>
                <a href="#about" className="nav-link scroll-link">
                  ABOUT
                </a>
              </li>
              <li>
                <a href="#contact" className="nav-link scroll-link">
                  CONTACT
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>

       {/* --- UPGRADE: Made the modal search functional --- */}
            {showSearchModal && (
                <div className="search-modal-overlay" onClick={() => setShowSearchModal(false)}>
                    <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="search-modal-close" onClick={() => setShowSearchModal(false)}>
                            &times;
                        </button>
                        <h2>Search Our Store</h2>
                        {/* Converted div to form and linked state/handlers */}
                        <form className="search-modal-container" onSubmit={handleModalSearch}>
                            <input
                                type="text"
                                className="search-modal-input"
                                placeholder="What are you looking for?"
                                value={modalSearchQuery}
                                onChange={(e) => setModalSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="search-modal-icon-button" aria-label="Search">
                               <i className="fa-solid fa-magnifying-glass search-modal-icon"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}

      {showLoginModal && (
        <div className="modal" id="login-modal">
          <div
            className={`modal-content ${
              isPhoneLogin ? 'otp-login-active' : ''
            }`}
          >
            <span
              className="close-modal"
              onClick={() => setShowLoginModal(false)}
            >
              &times;
            </span>
            <h2>Log in to your account</h2>
            <div className="modal-welcome">Welcome to Timeless Tribe</div>
            <form className="modal-form" onSubmit={handleLogin}>
              <div
                className={`modal-input-group ${
                  isPhoneLogin ? 'has-country-code' : ''
                }`}
              >
                {!isPhoneLogin && <i className="fa-regular fa-user"></i>}
                {isPhoneLogin && (
                  <div className="country-code-container">
                    <img src="/assets/images/flag.png" alt="Nepal Flag" />
                    <span>+977</span>
                  </div>
                )}
                <input
                  type="text"
                  id="login-identifier"
                  placeholder="Email or Mobile Number"
                  required
                  value={loginIdentifier}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLoginIdentifier(value);
                    setIsPhoneLogin(/^[0-9]+$/.test(value));
                  }}
                />
              </div>

              {isPhoneLogin ? (
                <button
                  type="button"
                  className="modal-continue"
                  onClick={handleLoginWithOtpRequest}
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Login with OTP'}
                </button>
              ) : (
                <>
                  <div className="modal-input-group">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      type="password"
                      id="login-password"
                      placeholder="Enter Password"
                      required
                    />
                    <i
                      className="fa-regular fa-eye-slash toggle-password"
                      style={{ cursor: 'pointer' }}
                      onClick={() => togglePasswordVisibility('login-password')}
                    ></i>
                  </div>

                  <div className="recaptcha-wrapper">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={(token) => {
                        setRecaptchaToken(token);
                        setRecaptchaError('');
                      }}
                      onExpired={() => {
                        setRecaptchaToken(null);
                        setRecaptchaError('');
                      }}
                    />

                    {recaptchaError && (
                      <p className="recaptcha-error">{recaptchaError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="modal-continue"
                    disabled={!recaptchaToken || loading}
                  >
                    {loading ? 'Logging in...' : 'Continue'}
                  </button>
                </>
              )}
            </form>{' '}
            <a
              href="#"
              className="modal-forgot"
              id="forgot-password"
              onClick={openForgotPasswordModal}
            >
              Forgot Password?
            </a>
            <div className="modal-or">
              <span>OR</span>
            </div>
            <GoogleLoginButton
              onSuccess={handleGoogleLogin}
              onFailure={handleGoogleLoginFailure}
              loading={googleLoginLoading}
            />
            <div className="modal-switch">
              Don't have an account?{' '}
              <a
                href="#"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowSignupModal(true);
                }}
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="modal" id="signup-modal">
          <div className="modal-content">
            <span
              className="close-modal"
              onClick={() => setShowSignupModal(false)}
            >
              &times;
            </span>
            <h2>Create your account</h2>
            <div className="modal-welcome">Join the Timeless Tribe</div>

            <form className="modal-form" onSubmit={handleSignup}>
              <div className="modal-input-group">
                <i className="fa-regular fa-user"></i>
                <input
                  type="text"
                  id="signup-name"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div
                className={`modal-input-group ${
                  isPhoneSignup ? 'has-country-code' : ''
                }`}
              >
                {!isPhoneSignup && <i className="fa-regular fa-envelope"></i>}
                {isPhoneSignup && (
                  <div className="country-code-container">
                    <img src="/assets/images/flag.png" alt="Nepal Flag" />
                    <span>+977</span>
                  </div>
                )}
                <input
                  type="text"
                  id="signup-identifier"
                  placeholder="Email or Mobile Number"
                  required
                  onChange={(e) =>
                    setIsPhoneSignup(/^[0-9]+$/.test(e.target.value))
                  }
                />
              </div>

              <div className="modal-input-group">
                <i className="fa-solid fa-lock"></i>
                <input
                  type="password"
                  id="signup-password"
                  placeholder="Create Password"
                  required
                />
                <i
                  className="fa-regular fa-eye-slash toggle-password"
                  style={{ cursor: 'pointer' }}
                  onClick={() => togglePasswordVisibility('signup-password')}
                ></i>
              </div>

              <div className="recaptcha-wrapper">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setRecaptchaToken(token);
                    setRecaptchaError('');
                  }}
                  onExpired={() => {
                    setRecaptchaToken(null);
                    setRecaptchaError('');
                  }}
                />

                {recaptchaError && (
                  <p className="recaptcha-error">{recaptchaError}</p>
                )}
              </div>

              <button
                type="submit"
                className="modal-continue"
                disabled={!recaptchaToken || loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>

            <div className="modal-or">
              <span>OR</span>
            </div>

            <GoogleLoginButton
              onSuccess={handleGoogleSignup}
              onFailure={handleGoogleSignupFailure}
              loading={googleSignupLoading}
            />

            <div className="modal-switch">
              Already have an account?{' '}
              <a
                href="#"
                onClick={() => {
                  setShowSignupModal(false);
                  setShowLoginModal(true);
                }}
              >
                Log in
              </a>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="modal" id="otp-modal">
          <div className="modal-content">
            <span
              className="close-modal"
              onClick={() => setShowOtpModal(false)}
            >
              &times;
            </span>

            {otpVerificationStatus === 'verifying' && (
              <div className="verification-status verifying">
                <div className="loading-spinner"></div>
                <h2>Verifying OTP</h2>
                <p>Please wait while we verify your code...</p>
              </div>
            )}

            {!otpVerificationStatus && (
              <>
                <h2>Verify Your {otpData?.isPhone ? 'Phone' : 'Email'}</h2>
                <div className="modal-welcome">
                  We sent a verification code to your{' '}
                  {otpData?.isPhone ? 'phone' : 'email'}
                </div>
                <div className="otp-identifier">{otpData?.identifier}</div>

                <form className="modal-form" onSubmit={handleOtpVerification}>
                  <div className="modal-input-group">
                    <i className="fa-solid fa-shield-halved"></i>
                    <input
                      type="text"
                      id="otp-input"
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                      value={otpInput}
                      onChange={handleOtpInputChange}
                    />
                  </div>

                  {otpError && <p className="otp-error-message">{otpError}</p>}

                  <button
                    type="submit"
                    className="modal-continue verify-btn"
                    disabled={otpVerificationStatus === 'verifying'}
                  >
                    {otpVerificationStatus === 'verifying'
                      ? 'Verifying...'
                      : 'Verify OTP'}
                  </button>
                </form>

                <div className="otp-resend">
                  {resendCooldown > 0 ? (
                    <span>Resend OTP in {resendCooldown}s</span>
                  ) : (
                    <>
                      Didn't receive the code?
                      <button
                        onClick={handleResendOtp}
                        className="resend-btn"
                        disabled={isResending}
                      >
                        {isResending ? 'Sending...' : 'Resend OTP'}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- NEW PASSWORD RESET MODAL FOR LOGGED-IN USERS --- */}
      {/* --- PASSWORD RESET MODAL FOR LOGGED-IN USERS (UPDATED) --- */}
      {showResetPasswordModal && (
        <div className="modal" id="reset-password-modal">
          <div className="modal-content">
            <span
              className="close-modal"
              onClick={() => setShowResetPasswordModal(false)}
            >
              &times;
            </span>

            {resetStage === 'choose' && (
              <>
                <h2>Secure Your Account</h2>
                <div className="modal-welcome">
                  Please choose a verified method to receive your OTP.
                </div>
                <div className="reset-method-buttons">
                  {user?.isEmailVerified && user.email && (
                    <button
                      onClick={() => handleChooseResetMethod('email')}
                      className="modal-continue"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-envelope"></i> Send to Email (
                      {user.email})
                    </button>
                  )}
                  {user?.isMobileVerified && user.mobile && (
                    <button
                      onClick={() => handleChooseResetMethod('mobile')}
                      className="modal-continue"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-mobile-screen-button"></i> Send
                      to Mobile ({user.mobile})
                    </button>
                  )}
                </div>
              </>
            )}

            {resetStage === 'verify' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetStage('reset');
                }}
              >
                <h2>Enter Verification Code</h2>
                <div className="modal-welcome">
                  An OTP has been sent to your {resetMethod}. Please enter it
                  below.
                </div>
                <div className="modal-input-group">
                  <i className="fa-solid fa-shield-halved"></i>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength="6"
                    value={resetForm.otp}
                    onChange={handleResetFormChange}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="modal-continue"
                  disabled={resetForm.otp.length !== 6}
                >
                  Proceed
                </button>
                <div className="otp-resend">
                  {resendCooldown > 0 ? (
                    <span>Resend OTP in {resendCooldown}s</span>
                  ) : (
                    <>
                      Did not receive it?
                      <button
                        onClick={handleResendResetOtp}
                        className="resend-btn"
                        disabled={isResending}
                      >
                        {isResending ? 'Sending...' : 'Resend'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {resetStage === 'reset' && (
              <form className="modal-form" onSubmit={handleFinalPasswordReset}>
                <h2>Create New Password</h2>
                <div className="modal-welcome">
                  Your new password must be at least 6 characters long.
                </div>
                <div className="modal-input-group">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    required
                    minLength="6"
                    value={resetForm.newPassword}
                    onChange={handleResetFormChange}
                    autoFocus
                  />
                </div>
                <div className="modal-input-group">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    placeholder="Confirm New Password"
                    required
                    value={resetForm.confirmNewPassword}
                    onChange={handleResetFormChange}
                  />
                </div>
                {passwordMatch === true && (
                  <p className="password-match-msg success">
                    <i className="fa-solid fa-check-circle"></i> Passwords
                    match!
                  </p>
                )}
                {passwordMatch === false &&
                  resetForm.confirmNewPassword.length > 0 && (
                    <p className="password-match-msg error">
                      <i className="fa-solid fa-times-circle"></i> Passwords do
                      not match.
                    </p>
                  )}
                <button
                  type="submit"
                  className="modal-continue"
                  disabled={!passwordMatch || loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {showCartModal && (
        <div className="modal" id="cart-modal">
          <div className="modal-content cart-modal-content">
            <span
              className="close-modal"
              onClick={() => setShowCartModal(false)}
            >
              &times;
            </span>

            {!user ? (
              <div id="cart-not-logged-in" className="cart-not-logged-in">
                <div className="cart-illustration">
                  <div className="laptop-icon">
                    <div className="laptop-screen">
                      <i className="fa-solid fa-cart-shopping"></i>
                      <i className="fa-solid fa-arrow-down"></i>
                    </div>
                  </div>
                  <div className="floating-icons">
                    <i
                      className="fa-solid fa-lightbulb"
                      style={{ color: '#4285f4' }}
                    ></i>
                    <i
                      className="fa-solid fa-mobile-alt"
                      style={{ color: '#ea4335' }}
                    ></i>
                    <i
                      className="fa-solid fa-tag"
                      style={{ color: '#fbbc05' }}
                    ></i>
                    <i
                      className="fa-solid fa-box"
                      style={{ color: '#4285f4' }}
                    ></i>
                    <i
                      className="fa-solid fa-tshirt"
                      style={{ color: '#ea4335' }}
                    ></i>
                    <i
                      className="fa-solid fa-car"
                      style={{ color: '#fbbc05' }}
                    ></i>
                  </div>
                </div>
                <h2>Missing Cart items?</h2>
                <p>Log in to access your cart</p>
                <button
                  className="cart-login-btn"
                  onClick={() => {
                    setShowCartModal(false);
                    setShowLoginModal(true);
                  }}
                >
                  Login
                </button>
              </div>
            ) : (
              <div className="empty-cart">
                <i className="fa-solid fa-bag-shopping"></i>
                <h3>Your cart is empty.</h3>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <button
                  className="continue-shopping-btn"
                  onClick={() => setShowCartModal(false)}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {notification.show && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: '', type: '' })
          }
        />
      )}

      {confirmPopup.show && (
        <ConfirmPopup
          message={confirmPopup.message}
          onConfirm={() => {
            if (confirmPopup.onConfirm) confirmPopup.onConfirm();
            setConfirmPopup({ show: false, message: '', onConfirm: null });
          }}
          onCancel={() =>
            setConfirmPopup({ show: false, message: '', onConfirm: null })
          }
        />
      )}
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        items={wishlist}
        onRemoveItem={handleRemoveFromWishlist}
        onMoveItemToCart={handleMoveToCart}
        showNotification={showNotificationPopup}
      />

      {showForgotPasswordModal && (
        <div className="modal" id="forgot-password-modal">
          <div className="modal-content">
            <span
              className="close-modal"
              onClick={() => setShowForgotPasswordModal(false)}
            >
              &times;
            </span>

            {forgotPasswordStage === 'request' ? (
              <>
                <h2>Reset Your Password</h2>
                <div className="modal-welcome">
                  Enter your email or mobile to receive a verification code.
                </div>
                <form
                  className="modal-form"
                  onSubmit={handleForgotPasswordRequest}
                >
                  <div
                    className={`modal-input-group ${
                      isPhoneReset ? 'has-country-code' : ''
                    }`}
                  >
                    {!isPhoneReset && <i className="fa-regular fa-user"></i>}
                    {isPhoneReset && (
                      <div className="country-code-container">
                        <img src="/assets/images/flag.png" alt="Nepal Flag" />
                        <span>+977</span>
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Email or Mobile Number"
                      required
                      value={resetIdentifier}
                      onChange={(e) => {
                        const value = e.target.value;
                        setResetIdentifier(value);
                        setIsPhoneReset(/^[0-9]+$/.test(value));
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="modal-continue"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Enter Verification Code</h2>
                <div className="modal-welcome">
                  Check your {isPhoneReset ? 'phone' : 'email'} for the 6-digit
                  OTP.
                </div>
                <form className="modal-form" onSubmit={handleResetPassword}>
                  <div className="modal-input-group">
                    <i className="fa-solid fa-shield-halved"></i>
                    <input
                      type="text"
                      id="otp-input"
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength="6"
                    />
                  </div>
                  <div className="modal-input-group">
                    <i className="fa-solid fa-lock"></i>
                    <input
                      type="password"
                      id="new-password"
                      placeholder="Enter New Password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="modal-continue"
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
