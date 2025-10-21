import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose, showNotification }) => {
  const { addToCart } = useAuth();

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const firstAvailable = selectedVariant.stockBySize.find((s) => s.stock > 0);
    setSelectedSize(firstAvailable ? firstAvailable.size : null);
  }, [selectedVariant]);

  const discountPercentage = useMemo(() => {
    if (
      !selectedVariant ||
      selectedVariant.originalPrice <= selectedVariant.price
    ) {
      return 0;
    }
    return Math.round(
      ((selectedVariant.originalPrice - selectedVariant.price) /
        selectedVariant.originalPrice) *
        100,
    );
  }, [selectedVariant]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showNotification('Please select a size.', 'error');
      return;
    }

    const result = await addToCart({
      productId: product._id,
      variantName: selectedVariant.name,
      size: selectedSize,
      quantity: 1,
    });

    if (result.success) {
      showNotification(`${product.name} added to cart!`, 'success');
      onClose();
    } else {
      showNotification(result.message || 'Failed to add to cart.', 'error');
    }
  };

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="quick-view-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="qv-grid">
          <div className="qv-image-gallery">
            <img
              src={selectedVariant.images[0]?.url}
              alt={selectedVariant.name}
            />
            {/* --- NEW: Discount Badge --- */}
            {discountPercentage > 0 && (
              <span className="qv-discount-badge">
                {discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="qv-product-details">
            <h2>{product.name}</h2>
            <p className="qv-artisan">by {product.artisan?.name}</p>

            <div className="qv-price">
              <span>Rs. {selectedVariant.price.toLocaleString()}</span>
              {selectedVariant.originalPrice > selectedVariant.price && (
                <del>Rs. {selectedVariant.originalPrice.toLocaleString()}</del>
              )}
            </div>

            {product.variants.length > 1 && (
              <div className="qv-variants">
                <label>
                  Color: <strong>{selectedVariant.name}</strong>
                </label>
                <div className="qv-swatches">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.name}
                      className={`swatch ${
                        selectedVariant.name === variant.name ? 'active' : ''
                      }`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <img src={variant.swatchImage} alt={variant.name} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="qv-sizes">
              <label>Select Size:</label>
              <div className="qv-size-options">
                {selectedVariant.stockBySize.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    className={`size-btn ${
                      selectedSize === sizeInfo.size ? 'active' : ''
                    }`}
                    disabled={sizeInfo.stock <= 0}
                    onClick={() => setSelectedSize(sizeInfo.size)}
                  >
                    {sizeInfo.size}
                    {sizeInfo.stock <= 0 && (
                      <span className="strikethrough"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="qv-add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
