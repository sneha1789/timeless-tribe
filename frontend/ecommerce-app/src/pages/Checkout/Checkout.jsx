import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import api, { authAPI } from '../../services/authAPI';
import { shopAPI } from '../../services/shopAPI';
import ConfirmPopup from '../../components/Popups/ConfirmPopup';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import LoadingPopup from '../../components/Popups/LoadingPopup';
import AddressSelectionModal from '../../components/Modals/AddressSelectionModal';
import QuantitySelectionModal from '../../components/Modals/QuantitySelectionModal';
import CheckoutSkeleton from '../../components/Skeletons/CheckoutSkeleton';

import VariantSizeSelectionModal from '../../components/Modals/VariantSizeSelectionModal';

import './Checkout.css';

const Checkout = () => {
  const {
    user,
    cart,
    setWishlist,
    addToCart,
    removeCartItem,
    updateCartItemQuantity,
    updateCartItemDetails,
    setShowLoginModal,
    cleanupCorruptedCartItems,
  } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemToUpdateQuantity, setItemToUpdateQuantity] = useState(null);

  const [itemToUpdateOptions, setItemToUpdateOptions] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);

  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState({ freeShippingThreshold: 2000 });
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(cart.map((item) => item._id));
    }
  }, [cart]);

  const [showAllOffers, setShowAllOffers] = useState(false);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoading(true);
      try {
        const [settingsData, offersData, addressData] = await Promise.all([
          shopAPI.getSettings(),
          shopAPI.getOffersWithoutImages(),
          user ? authAPI.getAddresses() : Promise.resolve({ addresses: [] }),
        ]);

        setSettings(settingsData);
        setOffers(offersData);

        if (user && addressData.addresses && addressData.addresses.length > 0) {
          setAddresses(addressData.addresses);
          const defaultAddr =
            addressData.addresses.find((addr) => addr.isDefault) ||
            addressData.addresses[0];
          setSelectedAddress(defaultAddr);
        }
      } catch (error) {
        console.error('Failed to load checkout data:', error);
        showNotification('Failed to load page data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadCheckoutData();
  }, [user, showNotification]);

  useEffect(() => {
    if (cart.length > 0) {
      setSelectedItems(cart.map((item) => item._id));
    }
  }, [cart]);
  useEffect(() => {
    if (cart.some((item) => !item?.product)) {
      cleanupCorruptedCartItems();
    }
  }, []);

  const priceDetails = useMemo(() => {
    const itemsToCalculate = cart.filter((item) =>
      selectedItems.includes(item._id),
    );

    let subtotal = 0;
    let discountOnMRP = 0;

    itemsToCalculate.forEach((item) => {
      const variant = item.product?.variants?.find(
        (v) => v.name === item.variantName,
      );
      const itemPrice = variant?.price || item.price || 0;
      const itemOriginalPrice =
        variant?.originalPrice || item.originalPrice || itemPrice;

      subtotal += itemPrice * item.quantity;
      discountOnMRP += (itemOriginalPrice - itemPrice) * item.quantity;
    });

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        const calculatedDiscount =
          (subtotal * appliedCoupon.discountValue) / 100;
        couponDiscount = appliedCoupon.maxDiscountAmount
          ? Math.min(calculatedDiscount, appliedCoupon.maxDiscountAmount)
          : calculatedDiscount;
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
    }

    const totalAfterDiscounts = subtotal - couponDiscount;
    const deliveryFee =
      totalAfterDiscounts >= settings.freeShippingThreshold ? 0 : 150;
    const totalAmount = totalAfterDiscounts + deliveryFee;

    return {
      subtotal,
      discountOnMRP,
      couponDiscount,
      deliveryFee,
      totalAmount,
      itemCount: itemsToCalculate.length,
    };
  }, [cart, selectedItems, appliedCoupon, settings.freeShippingThreshold]);

  useEffect(() => {
    if (
      appliedCoupon &&
      priceDetails.subtotal < appliedCoupon.minimumPurchaseAmount
    ) {
      setAppliedCoupon(null);
      setCouponInput('');
      showNotification(
        `Coupon removed as cart total is now below Rs. ${appliedCoupon.minimumPurchaseAmount.toLocaleString()}.`,
        'error',
      );
    }
  }, [priceDetails.subtotal, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsLoading(true);
    setLoadingText('Applying Coupon...');
    try {
      const result = await shopAPI.applyCoupon(
        couponInput,
        priceDetails.subtotal,
      );
      if (result.success) {
        setAppliedCoupon(result.coupon);
        showNotification(result.message, 'success');
      }
    } catch (error) {
      setAppliedCoupon(null);
      showNotification(
        error.response?.data?.message || 'Failed to apply coupon.',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    showNotification('Coupon removed.', 'info');
  };

  const handleRemoveItem = (itemId) => {
    setItemToRemove(itemId);
  };
  const confirmRemoveItem = useCallback(async () => {
    if (!itemToRemove) return;
    setIsLoading(true);
    setLoadingText('Removing item...');
    const result = await removeCartItem(itemToRemove);
    if (result.success) {
      showNotification('Item removed from cart.', 'success');
    } else {
      showNotification(result.message || 'Failed to remove item.', 'error');
    }
    setIsLoading(false);
    setItemToRemove(null);
  }, [itemToRemove, removeCartItem, showNotification]);

  const handleMoveToWishlist = async (cartItem) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setIsLoading(true);
    setLoadingText('Moving to wishlist...');
    try {
      const wishlistResponse = await authAPI.addToWishlist(
        cartItem.product._id,
      );
      setWishlist(wishlistResponse.wishlist);
      await removeCartItem(cartItem._id);
      showNotification('Moved to wishlist!', 'success');
    } catch (error) {
      showNotification(error.message || 'Failed to move to wishlist.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stockForQtyModal = useMemo(() => {
    if (!itemToUpdateQuantity || !itemToUpdateQuantity.product)
      return undefined;
    const variant = itemToUpdateQuantity.product.variants?.find(
      (v) => v.name === itemToUpdateQuantity.variantName,
    );
    const sizeInfo = variant?.stockBySize?.find(
      (s) => s.size === itemToUpdateQuantity.size,
    );
    return sizeInfo?.stock;
  }, [itemToUpdateQuantity]);

  const handleOpenQuantityModal = (item) => {
    setItemToUpdateQuantity(item);
  };

  const handleUpdateQuantity = useCallback(
    async (itemId, newQuantity) => {
      setIsLoading(true);
      setLoadingText('Updating quantity...');
      const result = await updateCartItemQuantity(itemId, newQuantity);
      if (result.success) {
        showNotification('Quantity updated.', 'success');
      } else {
        showNotification(
          result.message || 'Failed to update quantity.',
          'error',
        );
      }
      setIsLoading(false);
      setItemToUpdateQuantity(null);
    },
    [updateCartItemQuantity, showNotification],
  );

  const handleOpenOptionsModal = (item) => {
    setItemToUpdateOptions(item);
  };

  const handleUpdateOptions = async (newVariant, newSize) => {
    setIsLoading(true);
    setLoadingText('Updating item...');

    const result = await updateCartItemDetails(itemToUpdateOptions._id, {
      variantName: newVariant.name,
      size: newSize,
    });

    if (result.success) {
      showNotification('Item updated successfully!', 'success');
    } else {
      showNotification(result.message || 'Failed to update item.', 'error');
    }

    setIsLoading(false);
    setItemToUpdateOptions(null);
  };

  const handleItemSelection = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId],
    );
  };

  const sortedCartItems = useMemo(() => {
    if (!cart) return [];

    const enrichedCart = cart.map((item) => {
      const variant = item.product?.variants?.find(
        (v) => v.name === item.variantName,
      );
      const sizeInfo = variant?.stockBySize?.find((s) => s.size === item.size);
      const isOutOfStock = !sizeInfo || sizeInfo.stock <= 0;
      return { ...item, isOutOfStock };
    });

    return enrichedCart.sort((a, b) => a.isOutOfStock - b.isOutOfStock);
  }, [cart]);

  const { oosSelectedCount, isProceedDisabled } = useMemo(() => {
    const selectedOosItems = sortedCartItems.filter(
      (item) => selectedItems.includes(item._id) && item.isOutOfStock,
    );
    return {
      oosSelectedCount: selectedOosItems.length,
      isProceedDisabled: selectedOosItems.length > 0,
    };
  }, [selectedItems, sortedCartItems]);

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item._id));
    }
  };

  const handleAddNewFromOptions = async (newVariant, newSize) => {
    setIsLoading(true);
    setLoadingText('Adding new item...');

    const result = await addToCart({
      productId: itemToUpdateOptions.product._id,
      variantName: newVariant.name,
      size: newSize,
      quantity: 1,
    });

    if (result.success) {
      showNotification('New item added to cart!', 'success');
    } else {
      showNotification(result.message || 'Failed to add new item.', 'error');
    }

    setIsLoading(false);
    setItemToUpdateOptions(null);
  };

  const handleOpenAddressModal = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowAddressModal(true);
  };
  const handleCloseAddressModal = () => setShowAddressModal(false);
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    handleCloseAddressModal();
    showNotification('Delivery address updated.', 'info');
  };
  const handleAddNewAddress = () => {
    navigate('/profile?section=addresses-section');
    handleCloseAddressModal();
  };

const handleContinueToPayment = async () => {
  if (!user) {
    setShowLoginModal(true);
    return;
  }
  if (selectedItems.length === 0) {
    showNotification('Please select an item to proceed.', 'error');
    return;
  }
  if (isProceedDisabled) {
    showNotification('Please remove out-of-stock items from your selection.', 'error');
    return;
  }
  if (!selectedAddress) {
    showNotification('Please select a delivery address.', 'error');
    return;
  }

  setIsLoading(true);
  setLoadingText('Creating Your Order...');

  try {
    const orderPayload = {
      itemIds: selectedItems,
      shippingAddressId: selectedAddress._id,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
    };

    const response = await api.post('/orders/create-draft-order', orderPayload);
    const { draftOrderId, totalPrice } = response.data;

    if (draftOrderId && typeof totalPrice !== 'undefined') {
      // ✅ NEW: Show notification about order update
      showNotification('Order updated with new address!', 'success');
      navigate('/checkout/payment', { state: { orderId: draftOrderId, totalPrice } });
    } else {
      throw new Error('Backend did not return required draft order details.');
    }
  } catch (error) {
    console.error('Failed to create draft order:', error);
    showNotification(
      error.response?.data?.message || 'Failed to prepare your order. Please try again.',
      'error'
    );
    setIsLoading(false);
  }
};
  if (loading) {
    return <CheckoutSkeleton />;
  }

  if (!cart) {
    return <LoadingPopup message="Loading cart items..." />;
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page-container empty-cart-state">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Add some products to continue shopping</p>
          <Link to="/" className="cta-button">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      {/* Popups */}
      {isLoading && <LoadingPopup message={loadingText} />}
      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {itemToRemove && (
        <ConfirmPopup
          message="Remove this item from your cart?"
          onConfirm={confirmRemoveItem}
          onCancel={() => setItemToRemove(null)}
        />
      )}
      {itemToUpdateQuantity && (
        <QuantitySelectionModal
          item={itemToUpdateQuantity}
          availableStock={stockForQtyModal}
          onUpdateQuantity={handleUpdateQuantity}
          onClose={() => setItemToUpdateQuantity(null)}
        />
      )}

      {/* THE NEW MODAL INSTANCE */}
      {itemToUpdateOptions && (
        <VariantSizeSelectionModal
          isOpen={!!itemToUpdateOptions}
          onClose={() => setItemToUpdateOptions(null)}
          product={itemToUpdateOptions.product}
          initialVariantName={itemToUpdateOptions.variantName}
          initialSize={itemToUpdateOptions.size}
          onUpdate={handleUpdateOptions}
          onAddNew={handleAddNewFromOptions}
          showNotification={showNotification}
        />
      )}

      {showAddressModal && (
        <AddressSelectionModal
          addresses={addresses}
          selectedAddress={selectedAddress}
          onSelectAddress={handleAddressSelect}
          onAddNewAddress={handleAddNewAddress}
          onClose={handleCloseAddressModal}
        />
      )}

      <main className="checkout-main-content">
        <div className="checkout-progress-bar">
          <div className="progress-step active">
            <span className="step-number">1</span> Cart
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <span className="step-number">2</span> Payment
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-left-column">
            <section className="checkout-section delivery-address-section">
              <div className="section-header">
                <h3>DELIVERY ADDRESS</h3>
                <button
                  className="btn-change-address"
                  onClick={handleOpenAddressModal}
                >
                  CHANGE
                </button>
              </div>
              {selectedAddress ? (
                <div className="selected-address-card">
                  <strong>{selectedAddress.fullName}</strong>
                  <span className="address-type-tag">
                    {selectedAddress.name}
                  </span>
                  <p>
                    {selectedAddress.street}, {selectedAddress.area},{' '}
                    {selectedAddress.city}
                  </p>
                  <p>Phone: {selectedAddress.phone}</p>
                </div>
              ) : (
                <div className="no-address-selected">
                  <p>Please select an address for delivery.</p>
                  <button
                    className="cta-button"
                    onClick={handleOpenAddressModal}
                  >
                    Select Address
                  </button>
                </div>
              )}
            </section>

            <section className="checkout-section available-offers-section">
              <div
                className="section-header"
                onClick={() => setShowAllOffers(!showAllOffers)}
              >
                <h3>AVAILABLE OFFERS</h3>
                {offers.length > 2 && (
                  <i
                    className={`fa-solid fa-chevron-down ${
                      showAllOffers ? 'rotated' : ''
                    }`}
                  ></i>
                )}
              </div>
              <div className={`offers-list ${showAllOffers ? 'expanded' : ''}`}>
                {(showAllOffers ? offers : offers.slice(0, 2)).map((offer) => (
                  <p key={offer._id} className="offer-item">
                    <i className="fa-solid fa-tag"></i>
                    <strong>{offer.title}:</strong> {offer.description}
                  </p>
                ))}
              </div>
            </section>

            <section className="checkout-section cart-items-list-section">
              <div className="cart-items-header">
                <input
                  type="checkbox"
                  className="select-all-checkbox"
                  checked={
                    cart.length > 0 && selectedItems.length === cart.length
                  }
                  onChange={handleSelectAll}
                />
                <h3>
                  {selectedItems.length} ITEM
                  {selectedItems.length !== 1 ? 'S' : ''} SELECTED
                </h3>
              </div>

              <div className="cart-items-container">
                {sortedCartItems.map((item) => {
                  if (!item.product) {
                    console.warn('Cart item has null product:', item);
                    return null;
                  }

                  const variant = item.product?.variants?.find(
                    (v) => v.name === item.variantName,
                  );

                  const displayImage =
                    item.image ||
                    variant?.images?.[0]?.url ||
                    '/images/placeholder.jpg';
                  const displayPrice = item.price || variant?.price || 0;
                  const displayOriginalPrice =
                    item.originalPrice ||
                    variant?.originalPrice ||
                    displayPrice;
                  const artisanName = item.product?.artisan?.name || 'Artisan';
                  const productName = item.product?.name || 'Product';
                  const productSlug = item.product?.slug || '#';

                  const itemDiscountPercentage =
                    displayOriginalPrice && displayOriginalPrice > displayPrice
                      ? Math.round(
                          ((displayOriginalPrice - displayPrice) /
                            displayOriginalPrice) *
                            100,
                        )
                      : 0;

                  const isSelected = selectedItems.includes(item._id);

                  return (
                    <div
                      key={item._id}
                      className={`cart-item-card ${
                        isSelected ? '' : 'unselected'
                      } ${item.isOutOfStock ? 'is-out-of-stock' : ''}`}
                    >
                      {item.isOutOfStock && (
                        <div className="oos-item-label">OUT OF STOCK</div>
                      )}
                      <input
                        type="checkbox"
                        className="item-select-checkbox"
                        checked={isSelected}
                        onChange={() => handleItemSelection(item._id)}
                      />
                      <Link
                        to={`/product/${productSlug}`}
                        className="item-thumbnail-link"
                      >
                        <div className="item-thumbnail">
                          <img
                            src={displayImage}
                            alt={productName}
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                      </Link>
                      <div className="item-details">
                        <Link
                          to={`/product/${productSlug}`}
                          className="item-name-link"
                        >
                          <h4 className="item-name">{productName}</h4>
                        </Link>
                        <p className="item-artisan">by {artisanName}</p>
                        {item.variantName && (
                          <p className="item-variant-name-display">
                            Variant: {item.variantName}
                          </p>
                        )}
                        <div className="item-variant-size">
                          <span>
                            Size:{' '}
                            <span
                              className="item-size-value"
                              onClick={() => handleOpenOptionsModal(item)}
                            >
                              {item.size || 'One Size'}{' '}
                              <i className="fa-solid fa-chevron-down"></i>
                            </span>
                          </span>
                          <span>
                            Qty:{' '}
                            <span
                              className={`item-qty-value ${
                                item.isOutOfStock ? 'disabled' : ''
                              }`}
                              onClick={
                                !item.isOutOfStock
                                  ? () => handleOpenQuantityModal(item)
                                  : undefined
                              }
                            >
                              {item.quantity}{' '}
                              <i className="fa-solid fa-chevron-down"></i>
                            </span>
                          </span>
                        </div>
                        <div className="item-price-info">
                          <span className="current-price">
                            Rs. {displayPrice?.toLocaleString()}
                          </span>
                          {itemDiscountPercentage > 0 && (
                            <>
                              <span className="original-price">
                                Rs. {displayOriginalPrice?.toLocaleString()}
                              </span>
                              <span className="discount-tag">
                                ({itemDiscountPercentage}% OFF)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="item-actions">
                        <button
                          className="remove-item-btn"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                        <button
                          className="move-to-wishlist-btn"
                          onClick={() => handleMoveToWishlist(item)}
                        >
                          MOVE TO WISHLIST
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="checkout-right-column">
            <section className="checkout-section coupon-section">
              <h3>COUPONS</h3>
              {appliedCoupon ? (
                <div className="coupon-applied-view">
                  <p>
                    <i className="fa-solid fa-circle-check"></i> Coupon{' '}
                    <strong>"{appliedCoupon.code}"</strong> applied!
                  </p>
                  <button onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <i className="fa-solid fa-tag"></i>
                  <input
                    type="text"
                    placeholder="Apply Coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button
                    className="btn-apply-coupon"
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                  >
                    APPLY
                  </button>
                </div>
              )}
            </section>
            <section className="checkout-section price-details-section">
              <h3>PRICE DETAILS ({priceDetails.itemCount} Items)</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>Rs. {priceDetails.subtotal.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Discount on MRP</span>
                  <span className="discount-amount">
                    - Rs. {priceDetails.discountOnMRP.toLocaleString()}
                  </span>
                </div>
                {priceDetails.couponDiscount > 0 && (
                  <div className="price-row">
                    <span>Coupon Discount</span>
                    <span className="discount-amount">
                      - Rs.{' '}
                      {Math.round(priceDetails.couponDiscount).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="price-row">
                  <span>
                    Delivery Fee
                    <span
                      className="info-icon"
                      data-tooltip={`Free delivery on orders above Rs. ${settings.freeShippingThreshold.toLocaleString()}`}
                    >
                      <i className="fa-solid fa-circle-info"></i>
                    </span>
                  </span>
                  <span
                    className={
                      priceDetails.deliveryFee === 0 ? 'free-delivery' : ''
                    }
                  >
                    {priceDetails.deliveryFee === 0
                      ? 'Free'
                      : `Rs. ${priceDetails.deliveryFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="price-separator"></div>
                <div className="price-row total-amount">
                  <span>Total Amount</span>
                  <span>
                    Rs. {Math.round(priceDetails.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                className="cta-button place-order-btn"
                onClick={handleContinueToPayment}
                disabled={
                  selectedItems.length === 0 ||
                  isProceedDisabled ||
                  !selectedAddress ||
                  isLoading
                }
              >
                {isLoading ? 'Processing...' : 'CONTINUE TO PAYMENT'}
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
