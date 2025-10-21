import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../../services/authAPI';
import ContactChangeModal from '../../components/ContactChangeModal/ContactChangeModal.jsx';
import ConfirmPopup from '../../components/Popups/ConfirmPopup';
import AddressForm from '../../components/AddressForm/AddressForm.jsx';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import ProfileSkeleton from '../../components/Skeletons/ProfileSkeleton';
import { orderAPI } from '../../services/orderAPI';
import OrderCard from '../../components/OrderCard/OrderCard';
import 'react-image-crop/dist/ReactCrop.css';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const VerificationModal = ({ type, value, isOpen, onClose, onSuccess }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyContactChange({ token: otp });
      onSuccess(response.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="contact-change-modal">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Verify Your New {type}</h2>
        <p>
          An OTP has been sent to <strong>{value}</strong>. Please enter it
          below.
        </p>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength="6"
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Update'}
          </button>
        </form>
      </div>
    </div>
  );
};

const InitialVerificationModal = ({
  type,
  value,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Reset timer when modal opens or closes
    setResendCooldown(0);
    setIsResending(false);
  }, [isOpen]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let response;
      if (type === 'email') {
        response = await authAPI.verifyEmail(value, otp); // Use the initial verification endpoint
      } else {
        response = await authAPI.verifyMobile(value, otp); // Use the initial verification endpoint
      }
      // Fetch the latest profile data after successful verification
      const updatedUserData = await authAPI.getProfile();
      onSuccess(updatedUserData); // Pass the full updated user object back
    } catch (err) {
      setError(err.message || 'Verification failed. Incorrect OTP?');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError(''); // Clear previous errors
    try {
      await authAPI.resendOTP(value, type); // Call resend OTP endpoint
      setResendCooldown(30); // Start 30-second cooldown
      // Maybe show a temporary success message for resend? (Optional)
    } catch (err) {
      setError(err.message || `Failed to resend OTP to ${type}.`);
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="contact-change-modal">
        {' '}
        {/* Reusing styles */}
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Verify Your {type}</h2>
        <p>
          An OTP has been sent to <strong>{value}</strong>. Please enter it
          below.
        </p>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError('');
            }} // Clear error on change
            required
            maxLength="6"
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading} className="verify-btn">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <div className="otp-resend">
          {resendCooldown > 0 ? (
            <span>Resend OTP in {resendCooldown}s</span>
          ) : (
            <>
              Didn't receive the code?
              <button
                onClick={handleResend}
                className="resend-btn"
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VerifiedStatus = ({ isVerified, type, isPending = false }) => (
  <span
    className={`verification-status ${isVerified ? 'is-verified' : ''} ${
      isPending ? 'is-pending' : ''
    }`}
  >
    <i
      className={`fa-solid ${
        isPending
          ? 'fa-hourglass-half'
          : isVerified
          ? 'fa-circle-check'
          : 'fa-circle-xmark'
      }`}
    ></i>
    {isPending
      ? `Pending ${type}`
      : isVerified
      ? `${type} Verified`
      : `${type} Not Verified`}
  </span>
);

const WishlistProductCard = ({
  product,
  onRemove,
  onMoveToCart,
  showNotification,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;
  });

  const [selectedSize, setSelectedSize] = useState(() => {
    if (
      selectedVariant &&
      selectedVariant.stockBySize &&
      selectedVariant.stockBySize.length > 0
    ) {
      return selectedVariant.stockBySize.find((s) => s.stock > 0)?.size || null;
    }
    return null;
  });

  useEffect(() => {
    if (
      selectedVariant &&
      selectedVariant.stockBySize &&
      selectedVariant.stockBySize.length > 0
    ) {
      setSelectedSize(
        selectedVariant.stockBySize.find((s) => s.stock > 0)?.size || null,
      );
    } else {
      setSelectedSize(null);
    }
  }, [selectedVariant]);

  if (!selectedVariant) {
    return (
      <div className="w-product-card empty">
        <p>Product data missing for a wishlisted item.</p>
        <button className="w-remove-btn" onClick={() => onRemove(product._id)}>
          Remove Broken Item
        </button>
      </div>
    );
  }

  const isProductCompletelySoldOut = product.variants.every((v) =>
    v.stockBySize.every((s) => s.stock === 0),
  );

  const currentSizeStockInfo = selectedVariant.stockBySize.find(
    (s) => s.size === selectedSize,
  );
  const selectedSizeStock = currentSizeStockInfo?.stock || 0;
  const isSelectedSizeOutOfStock =
    selectedSize !== null && selectedSizeStock === 0;

  const discountPercentage = Math.round(
    ((selectedVariant.originalPrice - selectedVariant.price) /
      selectedVariant.originalPrice) *
      100,
  );

  const handleMoveClick = () => {
    if (
      isProductCompletelySoldOut ||
      isSelectedSizeOutOfStock ||
      !selectedSize
    ) {
      showNotification('This item or selected size is unavailable.', 'error');
      return;
    }
    onMoveToCart(product, selectedVariant, selectedSize);
  };

  const allSizesToDisplay = selectedVariant.stockBySize
    .map((s) => s.size)
    .sort((a, b) => {
      const order = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // Fallback for non-standard sizes (like ring sizes)
      return a.localeCompare(b, undefined, { numeric: true });
    });

  return (
    <div
      className={`w-product-card ${
        isProductCompletelySoldOut || isSelectedSizeOutOfStock
          ? 'out-of-stock-visual'
          : ''
      }`}
    >
      <Link to={`/product/${product.slug}`} className="w-product-image-link">
        <img
          src={selectedVariant.images[0]?.url}
          alt={`${product.name} - ${selectedVariant.name}`}
        />
      </Link>

      <div className="w-product-details">
        <div className="w-product-info">
          <Link to={`/product/${product.slug}`}>
            <h3 className="w-product-name">{product.name}</h3>
          </Link>
          {/* Variant Selector: Small round images */}
          {product.variants.length >= 1 && (
            <div className="w-variant-selector">
              {product.variants.map((variantOption) => (
                <button
                  key={variantOption.name}
                  className={`w-variant-thumbnail ${
                    selectedVariant._id === variantOption._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedVariant(variantOption)}
                  title={variantOption.name}
                >
                  <img
                    src={variantOption.images[0]?.url}
                    alt={variantOption.name}
                  />
                </button>
              ))}
            </div>
          )}
          {/* Display current selected variant name if there are multiple */}
          {product.variants.length > 1 && (
            <span className="w-variant-name">{selectedVariant.name}</span>
          )}
          <p className="w-product-artisan">
            by {product.artisan?.name || 'Artisan'}
          </p>
          <div className="w-product-pricing">
            <span className="w-current-price">
              Rs. {selectedVariant.price.toLocaleString()}
            </span>
            {discountPercentage > 0 && (
              <>
                <del className="w-original-price">
                  Rs. {selectedVariant.originalPrice.toLocaleString()}
                </del>
                <span className="w-discount-tag">
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        <div className="w-product-actions">
          <div className="w-size-selector">
            <span>Size:</span>
            <div className="w-size-options">
              {allSizesToDisplay.map((size) => {
                const sizeInfo = selectedVariant.stockBySize.find(
                  (s) => s.size === size,
                );
                const isSizeUnavailable = !sizeInfo || sizeInfo.stock <= 0;
                return (
                  <button
                    key={size}
                    className={`w-size-btn ${
                      selectedSize === size ? 'active' : ''
                    } ${isSizeUnavailable ? 'unavailable' : ''}`}
                    onClick={() => setSelectedSize(size)}
                    disabled={isSizeUnavailable} // Truly disable the button
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-stock-indicator">
            {isSelectedSizeOutOfStock && (
              <span className="out">This size is out of stock</span>
            )}
            {selectedSize &&
              selectedSizeStock > 0 &&
              selectedSizeStock <= 5 && (
                <span className="low">Only {selectedSizeStock} left!</span>
              )}
          </div>

          <div className="w-action-buttons">
            <button
              className="w-remove-btn"
              onClick={() => onRemove(product._id)}
            >
              Remove
            </button>
            <button
              className="w-move-to-cart-btn"
              onClick={handleMoveClick}
              disabled={
                isProductCompletelySoldOut ||
                !selectedSize ||
                isSelectedSizeOutOfStock
              }
            >
              Move to Cart
            </button>
          </div>
        </div>
      </div>
      {isProductCompletelySoldOut && !isSelectedSizeOutOfStock && (
        <div className="w-stock-overlay">OUT OF STOCK</div>
      )}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user: authUser,
    setUser: setAuthUser,
    wishlist,
    setWishlist,
    addToCart,
  } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview-section');
  const [profileData, setProfileData] = useState({ name: '', dob: '' });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showContactChangeModal, setShowContactChangeModal] = useState(false);
  const [changeType, setChangeType] = useState(null);
  // const [changeValue, setChangeValue] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({ type: '', value: '' });
  const [showInitialVerifyModal, setShowInitialVerifyModal] = useState(false);
  const [initialVerifyData, setInitialVerifyData] = useState({
    type: '',
    value: '',
  });
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userData, addressData, allOrdersData] = await Promise.all([
          authAPI.getProfile(),
          authAPI.getAddresses(),
          orderAPI.getMyOrders(),
        ]);
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          dob: userData.dob
            ? new Date(userData.dob).toISOString().split('T')[0]
            : '',
        });
        setAddresses(addressData.addresses || []);

        const fetchedOrders = allOrdersData || [];
        setOrders(fetchedOrders);
        setRecentOrders((allOrdersData || []).slice(0, 2));
      } catch (err) {
        setError(err.message || 'Failed to load data. Please log in again.');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') || 'overview-section'; // Default to overview
    setActiveSection(section);

    // Fetch orders if navigating to the orders section
    if (section === 'orders-section' && orders.length === 0) {
      // Avoid re-fetching if already loaded
      const fetchAllOrders = async () => {
        setLoadingOrders(true);
        setOrdersError('');
        try {
          const fetchedOrders = await orderAPI.getMyOrders();
          setOrders(fetchedOrders);
        } catch (err) {
          setOrdersError(err.message || 'Failed to load orders.');
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchAllOrders();
    }
  }, [location.search, orders.length]); // Depend only on location.search

  useEffect(() => {
    if (passwordForm.newPassword || passwordForm.confirmNewPassword) {
      if (
        passwordForm.newPassword &&
        passwordForm.newPassword === passwordForm.confirmNewPassword
      ) {
        setPasswordMatch(true);
      } else {
        setPasswordMatch(false);
      }
    } else {
      setPasswordMatch(null);
    }
  }, [passwordForm.newPassword, passwordForm.confirmNewPassword]);

  // --- HANDLERS ---
  const showNotification = (message, type) =>
    setNotification({ show: true, message, type });

  // **FIX:** Cropper handler functions are now in the correct component.
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImageSrc(reader.result.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
      setShowCropper(true);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height,
    );
    setCrop(initialCrop);
  };

  const handleUploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      showNotification('Image upload failed. Please try again.', 'error');
      return;
    }
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    canvas.toBlob(async (blob) => {
      if (!blob) {
        showNotification('Failed to create image file.', 'error');
        return;
      }
      const formData = new FormData();
      formData.append('profilePicture', blob, 'profile.jpg');
      try {
        const response = await authAPI.updateProfilePicture(formData);
        if (response.success) {
          setUser((prev) => ({
            ...prev,
            profilePicture: response.profilePicture,
          }));
          showNotification('Profile picture updated!', 'success');
          setShowCropper(false);
        }
      } catch (err) {
        showNotification(
          err.message || 'Image upload failed. Please try again.',
          'error',
        );
      }
    }, 'image/jpeg');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedUserData = await authAPI.updateProfile(profileData);

      const fullUpdatedUser = { ...user, ...updatedUserData };
      setUser(fullUpdatedUser);
      setAuthUser(fullUpdatedUser);
      setProfileData({
        name: updatedUserData.name || '',
        dob: updatedUserData.dob
          ? new Date(updatedUserData.dob).toISOString().split('T')[0]
          : '',
      });
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleStartInitialVerification = async (type) => {
    const value = type === 'email' ? user?.email : user?.mobile;
    if (!value) {
      showNotification(`No ${type} found to verify.`, 'error');
      return;
    }
    try {
      // Call the resend OTP endpoint to trigger OTP send
      await authAPI.resendOTP(value, type);
      setInitialVerifyData({ type, value }); // Set data for the InitialVerificationModal
      setShowInitialVerifyModal(true); // Open the NEW modal
      showNotification(`OTP sent to your ${type}.`, 'success');
    } catch (err) {
      showNotification(
        err.message || `Failed to send OTP to ${type}.`,
        'error',
      );
    }
  };

  // Handler for the NEW InitialVerificationModal success
  const onInitialVerificationSuccess = (updatedUserData) => {
    setUser(updatedUserData); // Update local state
    setAuthUser(updatedUserData); // Update context state
    setShowInitialVerifyModal(false); // Close the modal
    showNotification(
      `${initialVerifyData.type} verified successfully!`,
      'success',
    );
  };

  // Handler for "Add" button - Opens ContactChangeModal
  const handleOpenAddModal = (type) => {
    setChangeType(type); // Set type to 'email' or 'mobile'
    setShowContactChangeModal(true); // Open the existing modal for adding/changing
  };

  // Handler for "Change" button - Opens ContactChangeModal
  const handleOpenChangeModal = (type) => {
    setChangeType(type);
    setShowContactChangeModal(true);
  };

  const onContactUpdateSuccess = (updatedUserData) => {
    setUser(updatedUserData); // Update local state
    setAuthUser(updatedUserData); // Update context state
    setShowContactChangeModal(false);
    // Determine if it was an add or change based on initial state? Or just generic message.
    showNotification(
      'Contact info updated successfully! You may need to verify the new contact.',
      'success',
    );
    // Check if verification is now needed for the new pending contact
    if (updatedUserData.pendingEmail || updatedUserData.pendingMobile) {
      setVerifyData({
        type: updatedUserData.pendingEmail ? 'email' : 'mobile',
        value: updatedUserData.pendingEmail || updatedUserData.pendingMobile,
      });
      setShowVerifyModal(true); // Open the modal to verify the PENDING change
    }
  };

  const handleStartPendingVerification = (type) => {
    const value = type === 'email' ? user?.pendingEmail : user?.pendingMobile;
    if (!value) {
      showNotification(`No pending ${type} found to verify.`, 'error');
      return;
    }
    setVerifyData({ type, value });
    setShowVerifyModal(true); // Open the modal for PENDING changes
    // Note: OTP should have been sent when the change was initiated. Add resend logic to VerificationModal if needed.
  };

  // Handler for VerificationModal success (for PENDING changes)
  const onPendingVerificationSuccess = (updatedUserData) => {
    setUser(updatedUserData); // Update local state
    setAuthUser(updatedUserData); // Update context state
    setShowVerifyModal(false); // Close the modal
    showNotification(
      `${verifyData.type} has been successfully verified and updated!`,
      'success',
    );
  };

  const _removeFromWishlistSilent = async (productId) => {
    try {
      const response = await authAPI.removeFromWishlist(productId);
      setWishlist(response.wishlist);
      return { success: true };
    } catch (error) {
      console.error('Silent wishlist removal failed:', error);
      return { success: false, error };
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const result = await _removeFromWishlistSilent(productId);
    if (result.success) {
      showNotification('Item removed from wishlist.', 'success');
    } else {
      showNotification(
        result.error?.message || 'Failed to remove item.',
        'error',
      );
    }
  };

  // 3. The "Move to Cart" function now calls the silent helper, showing only ONE notification.
  const handleMoveToCart = async (product, selectedVariant, selectedSize) => {
    const cartItemData = {
      productId: product._id,
      variantName: selectedVariant.name,
      size: selectedSize,
      quantity: 1,
    };

    const result = await addToCart(cartItemData);

    if (result.success) {
      // Show the primary notification
      showNotification(`${product.name} moved to cart!`, 'success');

      // Call the silent removal function, which does NOT show a notification
      await _removeFromWishlistSilent(product._id);
    } else {
      showNotification(
        result.message || 'Could not move item to cart.',
        'error',
      );
    }
  };
  const handlePasswordFormChange = (e) => {
    const { id, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [id]: value }));
    if (id === 'oldPassword' && passwordError) setPasswordError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordMatch) return;
    try {
      await authAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      showNotification('Password changed successfully!', 'success');
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setPasswordError('');
      setPasswordMatch(null);
    } catch (err) {
      if (err.message === 'Incorrect old password.') {
        setPasswordError(err.message);
      } else {
        showNotification(err.message, 'error');
      }
    }
  };

  const handleAddOrUpdateAddress = async (addressData) => {
    try {
      const response = editingAddress
        ? await authAPI.updateAddress(editingAddress._id, addressData)
        : await authAPI.addAddress(addressData);
      setAddresses(response.addresses);
      setShowAddressForm(false);
      setEditingAddress(null);
      showNotification(
        editingAddress ? 'Address updated!' : 'Address added!',
        'success',
      );
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteAddress = (addressId) => setAddressToDelete(addressId);

  const executeDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      const response = await authAPI.deleteAddress(addressToDelete);
      setAddresses(response.addresses);
      showNotification('Address deleted!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setAddressToDelete(null);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await authAPI.setDefaultAddress(addressId);
      setAddresses(response.addresses);
      showNotification('Default address updated!', 'success');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const executeLogout = () => {
    sessionStorage.setItem(
      'logoutMessage',
      JSON.stringify({
        message: 'You have successfully logged out.',
        type: 'success',
      }),
    );
    localStorage.clear();
    window.location.href = '/';
  };

  const handleRemovePicture = async () => {
    try {
      const response = await authAPI.removeProfilePicture();
      if (response.success) {
        setUser((prev) => ({ ...prev, profilePicture: '' }));
        showNotification('Profile picture removed!', 'success');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // const onVerificationSuccess = (updatedUserData) => {
  //   setUser(updatedUserData);
  //   setShowVerifyModal(false);
  //   showNotification(
  //     `${verifyData.type} has been successfully verified!`,
  //     'success',
  //   );
  // };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showNotification('Passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long.', 'error');
      return;
    }
    try {
      await authAPI.setPassword({ newPassword: passwordForm.newPassword });
      showNotification(
        'Password created successfully! You can now log in with your email and password.',
        'success',
      );
      setUser((prev) => ({ ...prev, hasPassword: true }));
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleAccountDelete = async (e) => {
    e.preventDefault();
    setDeleteError('');
    try {
      await authAPI.deleteAccount({ password: deletePassword });
      showNotification(
        'Account deleted successfully. You are being logged out.',
        'success',
      );
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 3000);
    } catch (err) {
      if (err.message === 'Incorrect password.') {
        setDeleteError(err.message);
      } else {
        showNotification(err.message, 'error');
        setShowDeleteConfirm(false);
      }
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }
  if (error || !user) {
    return (
      <div className="profile-page-error">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <p>{error || 'You must be logged in to view this page.'}</p>
        <Link to="/" className="cta-button">
          Back to Home
        </Link>
      </div>
    );
  }

  // --- Dynamic Button Logic ---
  const getEmailButton = () => {
    if (user.pendingEmail) {
      return (
        <button
          type="button"
          className="change-btn verify-btn"
          onClick={() => handleStartPendingVerification('email')}
        >
          Verify Now
        </button>
      );
    } else if (!user.email) {
      return (
        <button
          type="button"
          className="change-btn add-btn"
          onClick={() => handleOpenAddModal('email')}
        >
          Add Email
        </button>
      );
    } else if (!user.isEmailVerified) {
      return (
        <button
          type="button"
          className="change-btn verify-btn"
          onClick={() => handleStartInitialVerification('email')}
        >
          Verify Email
        </button>
      );
    } else {
      return (
        <button
          type="button"
          className="change-btn"
          onClick={() => handleOpenChangeModal('email')}
        >
          Change
        </button>
      );
    }
  };

  const getMobileButton = () => {
    if (user.pendingMobile) {
      return (
        <button
          type="button"
          className="change-btn verify-btn"
          onClick={() => handleStartPendingVerification('mobile')}
        >
          Verify Now
        </button>
      );
    } else if (!user.mobile) {
      return (
        <button
          type="button"
          className="change-btn add-btn"
          onClick={() => handleOpenAddModal('mobile')}
        >
          Add Mobile
        </button>
      );
    } else if (!user.isMobileVerified) {
      return (
        <button
          type="button"
          className="change-btn verify-btn"
          onClick={() => handleStartInitialVerification('mobile')}
        >
          Verify Mobile
        </button>
      );
    } else {
      return (
        <button
          type="button"
          className="change-btn"
          onClick={() => handleOpenChangeModal('mobile')}
        >
          Change
        </button>
      );
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const defaultAddress =
    addresses.find((addr) => addr.isDefault) || addresses[0];

  return (
    <div className="profile-page">
      <main className="profile-page-container">
        <div className="profile-grid">
          <aside className="profile-sidebar">
            <div className="sidebar-user-info">
              <div className="profile-picture-container large-pfp">
                <img
                  src={
                    user.profilePicture ||
                    'https://placehold.co/150x150/f4f1ed/3d352e?text=User' // Larger placeholder
                  }
                  alt="Profile"
                />
                <div className="picture-actions">
                  <label
                    htmlFor="profile-pic-upload"
                    className="upload-btn"
                    title="Change Picture"
                  >
                    <i className="fa-solid fa-camera"></i>
                  </label>
                  {user.profilePicture && (
                    <button
                      className="remove-btn"
                      title="Remove Picture"
                      onClick={handleRemovePicture}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="profile-pic-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                />
              </div>
              <div className="user-greeting">Hello,</div>             {' '}
              <div className="user-name">{user.name}</div>
              <p className="member-since">
                Member since {formatDate(user.createdAt)}
              </p>
                         {' '}
            </div>
            <nav className="sidebar-nav">
              <ul>
                <li>
                  <Link
                    to="/profile?section=overview-section"
                    className={`sidebar-link ${
                      activeSection === 'overview-section' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('overview-section')} // Keep onClick
                  >
                    <i className="fa-solid fa-grip"></i>
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile?section=orders-section" // Ensure this is correct
                    className={`sidebar-link ${
                      activeSection === 'orders-section' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('orders-section')} // Keep onClick for instant UI update
                  >
                    <i className="fa-solid fa-box-archive"></i> My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile?section=wishlist-section"
                    className={`sidebar-link ${
                      activeSection === 'wishlist-section' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('wishlist-section')}
                  >
                    <i className="fa-solid fa-heart"></i> My Wishlist
                  </Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link
                    to="/profile?section=details-section"
                    className={`sidebar-link ${
                      activeSection === 'details-section' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('details-section')}
                  >
                    <i className="fa-solid fa-user-pen"></i> Profile Details
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile?section=addresses-section"
                    className={`sidebar-link ${
                      activeSection === 'addresses-section' ? 'active' : ''
                    }`}
                    onClick={() => setActiveSection('addresses-section')}
                  >
                    <i className="fa-solid fa-location-dot"></i> Saved Addresses
                  </Link>
                </li>

                <li>
                  <Link
                    to="/profile?section=delete-account-section"
                    className={`sidebar-link ${
                      activeSection === 'delete-account-section' ? 'active' : ''
                    }`}
                  >
                    <i className="fa-solid fa-trash-can"></i> Delete Account
                  </Link>
                </li>
              </ul>
              <ul>
                <li>
                  <Link
                    to="/profile?section=logout-section"
                    className="sidebar-link logout-btn"
                    onClick={handleLogout}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
          <section className="profile-content">
            {/* --- NEW OVERVIEW SECTION --- */}
            <div
              id="overview-section"
              className={`profile-section ${
                activeSection === 'overview-section' ? 'active' : ''
              }`}
            >
              <h2>Account Overview</h2>
              <div className="overview-grid">
                {/* Recent Orders Widget */}
                <div className="overview-widget orders-widget">
                  <div className="widget-header">
                    <i className="fa-solid fa-box-archive widget-icon"></i>
                    <h3>Recent Orders</h3>
                  </div>
                  <div className="widget-content">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={order._id} className="recent-order-item">
                          <span className="recent-order-id">
                            #{order._id.slice(-8)}
                          </span>
                          <span
                            className={`recent-order-status status-${order.orderStatus
                              .toLowerCase()
                              .replace(/_/g, '-')}`}
                          >
                            {order.orderStatus.replace('_', ' ')}
                          </span>
                          <Link
                            to={`/order/${order._id}`}
                            className="recent-order-link"
                          >
                            View
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="no-recent-data">No recent orders found.</p>
                    )}
                    <Link
                      to="/profile?section=orders-section"
                      className="widget-link"
                    >
                      View All Orders{' '}
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>

{/* Account Status Widget (FIXED) */}
<div className="overview-widget status-widget">
  <div className="widget-header">
    <i className="fa-solid fa-shield-halved widget-icon"></i>
    <h3>Account Status</h3>
  </div>
  <div className="widget-content">

    {/* --- Email Status Item --- */}
    <div className="status-item">
      <div className="status-left"> {/* This wrapper is crucial */}
        <VerifiedStatus
          type="Email"
          isVerified={user.isEmailVerified}
          isPending={!!user.pendingEmail}
        />
      </div>
      {/* This is the button/link on the right */}
      {!user.isEmailVerified && !user.pendingEmail && user.email && (
        <button className="verify-btn" onClick={() => handleStartInitialVerification('email')}>
          Verify Email
        </button>
      )}
      {user.pendingEmail && (
        <button className="verify-btn" onClick={() => handleStartPendingVerification('email')}>
          Verify Change
        </button>
      )}
      {user.isEmailVerified && !user.pendingEmail && user.email && (
        <Link to="/profile?section=details-section" className="widget-link small-link">
          Change
        </Link>
      )}
      {!user.email && !user.pendingEmail && (
        <button className="add-btn1" onClick={() => handleOpenAddModal('email')}>
           Email
        </button>
      )}
    </div>

    {/* --- Mobile Status Item --- */}
    <div className="status-item">
      <div className="status-left"> {/* This wrapper is crucial */}
        <VerifiedStatus
          type="Mobile"
          isVerified={user.isMobileVerified}
          isPending={!!user.pendingMobile}
        />
      </div>
      {/* This is the button/link on the right */}
      {!user.isMobileVerified && !user.pendingMobile && user.mobile && (
        <button className="verify-btn" onClick={() => handleStartInitialVerification('mobile')}>
          Verify Mobile
        </button>
      )}
      {!user.mobile && !user.pendingMobile && (
        <button className="add-btn" onClick={() => handleOpenAddModal('mobile')}>
          Add Mobile
        </button>
      )}
      {user.pendingMobile && (
        <button className="verify-btn" onClick={() => handleStartPendingVerification('mobile')}>
          Verify Change
        </button>
      )}
      {user.isMobileVerified && !user.pendingMobile && user.mobile && (
        <Link to="/profile?section=details-section" className="widget-link small-link">
          Change
        </Link>
      )}
    </div>

    {/* --- Password Status Item --- */}
    <div className="status-item">
      <div className="status-left"> {/* This wrapper is crucial */}
        <i
          className={`fa-solid ${
            user.hasPassword ? 'fa-lock' : 'fa-lock-open'
          }`}
        ></i>
        <span>
          Password: {user.hasPassword ? 'Set' : 'Not Set'}
        </span>
      </div>
      <Link
        to="/profile?section=details-section#password"
        className="widget-link small-link"
      >
        {user.hasPassword ? 'Change' : 'Set Password'}
      </Link>
    </div>

    {/* --- DOB Status Item --- */}
    {!profileData.dob && (
      <div className="status-item incomplete-prompt">
        <div className="status-left"> {/* This wrapper is crucial */}
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Profile Incomplete</span>
        </div>
        <Link
          to="/profile?section=details-section"
          className="widget-link small-link"
        >
          Add DOB
        </Link>
      </div>
    )}
  </div>
</div>

                {/* Address Widget */}
                <div className="overview-widget address-widget">
                  <div className="widget-header">
                    <i className="fa-solid fa-location-dot widget-icon"></i>
                    <h3>Default Address</h3>
                  </div>
                  <div className="widget-content">
                    {defaultAddress ? (
                      <>
                        <p className="address-line">
                          <strong>{defaultAddress.fullName}</strong> (
                          {defaultAddress.name})
                        </p>
                        <p className="address-line">
                          {defaultAddress.street}, {defaultAddress.area}
                        </p>
                        <p className="address-line">{defaultAddress.city}</p>
                      </>
                    ) : (
                      <p className="no-recent-data">No default address set.</p>
                    )}
                    <p className="address-count">
                      You have {addresses.length} saved address
                      {addresses.length !== 1 ? 'es' : ''}.
                    </p>
                    <Link
                      to="/profile?section=addresses-section"
                      className="widget-link"
                    >
                      Manage Addresses{' '}
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>

                {/* Wishlist Widget */}
                <div className="overview-widget wishlist-widget">
                  <div className="widget-header">
                    <i className="fa-solid fa-heart widget-icon"></i>
                    <h3>Wishlist</h3>
                  </div>
                  <div className="widget-content">
                    <p className="wishlist-count">
                      {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}{' '}
                      saved.
                    </p>
                    {/* Optional: Add mini previews */}
                    <Link
                      to="/profile?section=wishlist-section"
                      className="widget-link"
                    >
                      View Wishlist <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>{' '}
              {/* End overview-grid */}
            </div>
            {/* --- END OVERVIEW SECTION --- */}
            <div
              id="details-section"
              className={`profile-section ${
                activeSection === 'details-section' ? 'active' : ''
              }`}
            >
              <h2>Edit Your Profile</h2>
              <form className="profile-form" onSubmit={handleProfileUpdate}>
                {/* ... (Name and DOB inputs) ... */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="full-name">Full Name</label>
                    <input
                      type="text"
                      id="full-name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input
                      type="date"
                      id="dob"
                      value={profileData.dob}
                      onChange={(e) =>
                        setProfileData({ ...profileData, dob: e.target.value })
                      }
                    />
                  </div>
                </div>
                {/* ... (Email and Mobile inputs) ... */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-with-status">
                      <input
                        type="email"
                        value={
                          user.pendingEmail || user.email || 'Not Provided'
                        }
                        disabled
                        className={
                          !user.email && !user.pendingEmail
                            ? 'not-provided'
                            : ''
                        }
                      />
                      {user.pendingEmail ? (
                        <VerifiedStatus type="Email" isPending={true} />
                      ) : (
                        user.email && (
                          <VerifiedStatus
                            isVerified={user.isEmailVerified}
                            type="Email"
                          />
                        )
                      )}
                    </div>
                    <div className="change-btn-wrapper">{getEmailButton()}</div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <div className="input-with-status">
                      <input
                        type="tel"
                        value={
                          user.pendingMobile || user.mobile || 'Not Provided'
                        }
                        disabled
                      />
                      {user.pendingMobile ? (
                        <VerifiedStatus type="Mobile" isPending={true} />
                      ) : (
                        user.mobile && (
                          <VerifiedStatus
                            isVerified={user.isMobileVerified}
                            type="Mobile"
                          />
                        )
                      )}
                    </div>
                    <div className="change-btn-wrapper">
                      {getMobileButton()}
                    </div>
                  </div>
                </div>
                <button type="submit" className="cta-button">
                  Save Changes
                </button>
              </form>
              <hr className="form-divider" />

              <h3>
                {user.hasPassword ? 'Change Password' : 'Create a Password'}
              </h3>
              {user.hasPassword ? (
                <form className="profile-form" onSubmit={handleChangePassword}>
                  <div className="form-group">
                    <label htmlFor="oldPassword">Old Password</label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordFormChange}
                      required
                    />
                    {passwordError && (
                      <p className="password-error-msg">{passwordError}</p>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmNewPassword">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordFormChange}
                        required
                      />
                      {passwordMatch === true && (
                        <p className="password-match-msg success">
                          Passwords match!
                        </p>
                      )}
                      {passwordMatch === false && (
                        <p className="password-match-msg error">
                          Passwords do not match.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="cta-button"
                    disabled={!passwordMatch}
                  >
                    Change Password
                  </button>
                </form>
              ) : (
                <form className="profile-form" onSubmit={handleSetPassword}>
                  <p>
                    You are signed in via a social account. To enable password
                    login, create one below.
                  </p>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmNewPassword">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmNewPassword"
                        value={passwordForm.confirmNewPassword}
                        onChange={handlePasswordFormChange}
                        required
                      />
                      {passwordMatch === false && (
                        <p className="password-match-msg error">
                          Passwords do not match.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="cta-button"
                    disabled={
                      !passwordForm.newPassword ||
                      passwordForm.newPassword !==
                        passwordForm.confirmNewPassword
                    }
                  >
                    Set Password
                  </button>
                </form>
              )}
            </div>

            <div
              id="orders-section"
              className={`profile-section ${
                activeSection === 'orders-section' ? 'active' : ''
              }`}
            >
              <h2>My Orders</h2>
              {loadingOrders ? (
                <div className="orders-loading">Loading your orders...</div>
              ) : ordersError ? (
                <div className="orders-error">{ordersError}</div>
              ) : orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>You haven't placed any orders yet.</h3>
                  <p>Start shopping to see your orders here!</p>
                  <Link to="/" className="cta-button">
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {/* --- PASTE THE NEW WISHLIST SECTION JSX HERE --- */}
            <div
              id="wishlist-section"
              className={`profile-section ${
                activeSection === 'wishlist-section' ? 'active' : ''
              }`}
            >
              <div className="section-header">
                <h2>My Wishlist</h2>
              </div>
              <div className="wishlist-scrollable-area">
                {wishlist && wishlist.length > 0 ? (
                  wishlist.map((product) => (
                    <WishlistProductCard
                      key={product._id}
                      product={product}
                      onRemove={handleRemoveFromWishlist}
                      onMoveToCart={handleMoveToCart}
                      showNotification={showNotification}
                    />
                  ))
                ) : (
                  <div className="empty-wishlist-message">
                    <h3>Your Wishlist is Empty</h3>
                    <p>Explore our collections and add your favorite items!</p>
                    <Link to="/" className="continue-shopping-btn">
                      Continue Shopping
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Addresses Section */}
            <div
              id="addresses-section"
              className={`profile-section ${
                activeSection === 'addresses-section' ? 'active' : ''
              }`}
            >
              <div className="section-header">
                <h2>Saved Addresses</h2>
                {!showAddressForm && (
                  <button
                    className="cta-button-outline"
                    onClick={() => {
                      setEditingAddress(null);
                      setShowAddressForm(true);
                    }}
                  >
                    + Add New Address
                  </button>
                )}
              </div>
              {showAddressForm ? (
                <AddressForm
                  onSave={handleAddOrUpdateAddress}
                  onCancel={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                  editingAddress={editingAddress}
                />
              ) : (
                <div id="saved-addresses-list">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`address-card ${
                          addr.isDefault ? 'is-default' : ''
                        }`}
                      >
                        {addr.isDefault && (
                          <div className="default-address-label">DEFAULT</div>
                        )}
                        <div className="address-details">
                          <div className="address-card-header">
                            <span className="address-name">
                              {addr.fullName}
                            </span>
                            <span className="address-type-tag">
                              {addr.name}
                            </span>
                          </div>
                          <p className="address-full">
                            {addr.street}, {addr.area}
                            <br />
                            {addr.city}, Nepal
                          </p>
                          <p className="address-mobile">Mobile: {addr.phone}</p>
                        </div>
                        <div className="address-actions">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setShowAddressForm(true);
                            }}
                          >
                            EDIT
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)}>
                            REMOVE
                          </button>
                        </div>
                        {!addr.isDefault && (
                          <div className="set-default-action">
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                            >
                              Set as Default
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <h3>No saved addresses yet.</h3>
                      <p>Add an address for a faster checkout experience.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Delete Account Section */}
            <div
              id="delete-account-section"
              className={`profile-section ${
                activeSection === 'delete-account-section' ? 'active' : ''
              }`}
            >
              <h2>Delete Account</h2>
              <div className="delete-warning-box">
                <h3>Are you absolutely sure?</h3>
                <p>
                  This action is irreversible and will permanently delete all
                  your data, including:
                </p>
                <ul>
                  <li>Your profile information and login credentials.</li>
                  <li>Your saved addresses.</li>
                  <li>Your entire order history.</li>
                  <li>Any reviews you have submitted.</li>
                </ul>
                <p>
                  If you still wish to proceed, please click the button below.
                </p>
                <button
                  className="cta-button delete-button"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete My Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modals and Popups */}
      {showCropper && (
        <div className="modal-overlay">
          <div className="cropper-modal">
            <h2>Edit Profile Picture</h2>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
              />
            </ReactCrop>
            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowCropper(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete-btn"
                onClick={handleUploadCroppedImage}
              >
                Save Picture
              </button>
            </div>
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
      <ContactChangeModal
        type={changeType}
        isOpen={showContactChangeModal}
        onClose={() => setShowContactChangeModal(false)}
        onSuccess={onContactUpdateSuccess}
        // Add a prop to differentiate Add vs Change if needed for modal title/text
        // isAdding={!user[changeType]} // Example: Pass true if the field is currently empty
      />
      {showLogoutConfirm && (
        <ConfirmPopup
          message="Are you sure you want to logout?"
          onConfirm={executeLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
      {addressToDelete && (
        <ConfirmPopup
          message="Are you sure you want to delete this address?"
          onConfirm={executeDeleteAddress}
          onCancel={() => setAddressToDelete(null)}
        />
      )}
      {/* Verification Modal (for PENDING changes) */}
      <VerificationModal
        type={verifyData.type}
        value={verifyData.value}
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={onPendingVerificationSuccess} // Use the correct success handler
      />

      {/* NEW: Initial Verification Modal */}
      <InitialVerificationModal
        type={initialVerifyData.type}
        value={initialVerifyData.value}
        isOpen={showInitialVerifyModal}
        onClose={() => setShowInitialVerifyModal(false)}
        onSuccess={onInitialVerificationSuccess} // Use the NEW success handler
      />

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h2>Confirm Account Deletion</h2>
            {user.hasPassword ? (
              <form onSubmit={handleAccountDelete}>
                <p>To confirm, please enter your password.</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                  autoFocus
                />
                {deleteError && (
                  <p className="password-error-msg">{deleteError}</p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="confirm-delete-btn">
                    Confirm & Delete
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p>
                  This will permanently delete your account. Confirm by
                  re-authenticating with your social provider.
                </p>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteError('');
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" className="confirm-delete-btn-google">
                    <i className="fa-brands fa-google"></i> Confirm with Google
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
