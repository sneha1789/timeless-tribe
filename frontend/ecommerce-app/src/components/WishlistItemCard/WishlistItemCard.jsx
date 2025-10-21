import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import './WishlistItemCard.css';

const OptionsSelectorModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  showNotification,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState(
    () =>
      product.variants[0]?.stockBySize.find((s) => s.stock > 0)?.size || null,
  );

  useEffect(() => {
    if (isOpen) {
      const defaultVariant = product.variants[0];
      setSelectedVariant(defaultVariant);
      setSelectedSize(
        defaultVariant?.stockBySize.find((s) => s.stock > 0)?.size || null,
      );
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    const firstAvailableSize =
      variant.stockBySize.find((s) => s.stock > 0)?.size || null;
    setSelectedSize(firstAvailableSize);

    if (!firstAvailableSize) {
      showNotification(`${variant.name} is currently out of stock.`, 'error');
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedVariant, selectedSize);
    onClose();
  };

  const allSizesToDisplay = selectedVariant.stockBySize
  .map((s) => s.size) // Get an array of only the available size names
  .sort((a, b) => {
    // Use the same sorting logic to keep them in a predictable order
    const order = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
    }
    // Fallback for non-standard sizes like ring sizes
    return a.localeCompare(b, undefined, { numeric: true });
  });

  const currentSizeStock =
    selectedVariant.stockBySize.find((s) => s.size === selectedSize)?.stock ||
    0;
  const isSelectionOutOfStock = selectedSize !== null && currentSizeStock === 0;

  return (
    <div className="options-modal-overlay" onClick={onClose}>
      <div
        className="options-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="om-header">
          <h4>Select Options for {product.name}</h4>
          <button onClick={onClose} className="om-close-btn">
            &times;
          </button>
        </div>
        <div className="om-body">
          <div className="om-image">
            <img
              src={selectedVariant.images[0]?.url}
              alt={selectedVariant.name}
            />
          </div>
          <div className="om-selectors">
            {product.variants.length >= 1 && (
              <div className="om-variant-selector">
                <label>
                  Color: <strong>{selectedVariant.name}</strong>
                </label>
                <div className="om-variant-swatches">
                  {product.variants.map((v) => (
                    <button
                      key={v.name}
                      className={`om-swatch ${
                        selectedVariant.name === v.name ? 'active' : ''
                      }`}
                      onClick={() => handleVariantSelect(v)}
                      title={v.name}
                    >
                      <img src={v.images[0]?.url} alt={v.name} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="om-size-selector">
              <label>Size:</label>
              <div className="om-size-options">
                {allSizesToDisplay.map((size) => {
                  const sizeInfo = selectedVariant.stockBySize.find(
                    (s) => s.size === size,
                  );
                  const isDisabled = !sizeInfo || sizeInfo.stock <= 0;
                  return (
                    <button
                      key={size}
                      className={`om-size-btn ${
                        selectedSize === size ? 'active' : ''
                      }`}
                      disabled={isDisabled}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="om-footer">
          <button
            className="om-add-to-cart-btn"
            onClick={handleAddToCartClick}
            disabled={!selectedSize || isSelectionOutOfStock}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const WishlistItemCard = ({
  product,
  onRemove,
  onMoveToCart,
  showNotification,
}) => {
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const displayVariant = product.variants?.[0];
  const isOutOfStock =
    !displayVariant ||
    product.variants.every((v) => v.stockBySize.every((s) => s.stock === 0));
  const requiresSelection =
    product.variants.length > 1 || displayVariant?.stockBySize.length > 1;
  const discountPercentage = displayVariant
    ? Math.round(
        ((displayVariant.originalPrice - displayVariant.price) /
          displayVariant.originalPrice) *
          100,
      )
    : 0;

  const handleMainButtonClick = () => {
    if (requiresSelection) {
      setShowOptionsModal(true);
    } else {
      const singleSize = displayVariant.stockBySize[0]?.size;
      if (singleSize) {
        onMoveToCart(product, displayVariant, singleSize);
      }
    }
  };

  return (
    <>
      <div
        className={`wishlist-item-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      >
        <Link
          to={`/product/${product.slug}`}
          className="wishlist-item-image-link"
        >
          <img src={displayVariant?.images[0]?.url} alt={product.name} />
        </Link>

        <div className="wishlist-item-details">
          <div className="item-info-top">
            <div className="item-name-artisan">
              <Link to={`/product/${product.slug}`} className="item-name-link">
                <h3 className="item-name">{product.name}</h3>
              </Link>
              <p className="item-artisan">
                by {product.artisan?.name || 'Artisan'}
              </p>
            </div>
            <button
              className="remove-btn"
              onClick={() => onRemove(product._id)}
              title="Remove from wishlist"
            >
              &times;
            </button>
          </div>

          <div className="item-pricing">
            <span className="current-price">
              Rs. {displayVariant?.price.toLocaleString()}
            </span>
            {discountPercentage > 0 && (
              <>
                <del className="original-price">
                  Rs. {displayVariant?.originalPrice.toLocaleString()}
                </del>
                <span className="discount-tag">{discountPercentage}% OFF</span>
              </>
            )}
          </div>

          <div className="item-actions-bottom">
            <button
              className="move-to-cart-btn"
              onClick={handleMainButtonClick}
              disabled={isOutOfStock}
            >
              {requiresSelection ? 'Select Options' : 'Move to Cart'}
            </button>
          </div>
        </div>
      </div>

      <OptionsSelectorModal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        product={product}
        onAddToCart={onMoveToCart}
        showNotification={showNotification}
      />
    </>
  );
};

export default WishlistItemCard;
