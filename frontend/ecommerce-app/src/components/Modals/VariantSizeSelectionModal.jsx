// src/components/Modals/VariantSizeSelectionModal.jsx

import React, { useState, useEffect } from 'react';
import './VariantSizeSelectionModal.css'; // We will create this file next

const VariantSizeSelectionModal = ({
  isOpen,
  onClose,
  product,
  initialVariantName,
  initialSize,
  onUpdate,
  onAddNew,
  showNotification,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (isOpen && product) {
      const initialVariant =
        product.variants.find((v) => v.name === initialVariantName) ||
        product.variants[0];
      setSelectedVariant(initialVariant);
      setSelectedSize(initialSize);
    }
  }, [isOpen, product, initialVariantName, initialSize]);

  if (!isOpen || !product || !selectedVariant) return null;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    const firstAvailableSize =
      variant.stockBySize.find((s) => s.stock > 0)?.size || null;
    setSelectedSize(firstAvailableSize);

    if (!firstAvailableSize) {
      showNotification(`${variant.name} is currently out of stock.`, 'error');
    }
  };

  const handleUpdateClick = () => {
    onUpdate(selectedVariant, selectedSize);
  };

  const handleAddNewClick = () => {
    onAddNew(selectedVariant, selectedSize);
  };

  const standardSizes = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];
  const variantSizes = selectedVariant.stockBySize.map((s) => s.size);
  const allSizesToDisplay = standardSizes.filter((size) =>
    variantSizes.includes(size),
  );

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
          <h4>Edit Options for {product.name}</h4>
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
            className="om-action-btn om-add-new-btn"
            onClick={handleAddNewClick}
            disabled={!selectedSize || isSelectionOutOfStock}
          >
            Add New
          </button>
          <button
            className="om-action-btn om-done-btn"
            onClick={handleUpdateClick}
            disabled={!selectedSize || isSelectionOutOfStock}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantSizeSelectionModal;
