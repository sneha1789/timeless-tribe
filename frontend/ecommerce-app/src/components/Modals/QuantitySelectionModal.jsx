import React, { useState } from 'react';
import './QuantitySelectionModal.css';

const QuantitySelectionModal = ({ item, availableStock, onUpdateQuantity, onClose }) => {
  const [selectedQty, setSelectedQty] = useState(item.quantity);

  // --- START: New Logic ---

  // 1. Set the maximum quantity a user can *ever* select in the dropdown.
  const MAX_DROPDOWN_LIMIT = 10;

  // 2. Determine the actual stock, defaulting to 0 if unknown.
  // We use 0 here to safely disable the button if stock is 'undefined'.
  const currentStock = availableStock ?? 0;

  // 3. Determine the number of options to show in the dropdown.
  // It's the *smallest* of:
  //    a) The real stock (e.g., 8)
  //    b) The hard limit (10)
  // We use Math.max(1, ...) to ensure the dropdown always shows at least '1'.
  const dropdownOptionCount = Math.max(1, Math.min(currentStock, MAX_DROPDOWN_LIMIT));

  // 4. Check if we should show the low stock warning.
  const showLowStockWarning = currentStock > 0 && currentStock <= 5;
  
  // --- END: New Logic ---

  const handleConfirm = () => {
    // The button's disabled check is the primary safeguard, but we double-check here.
    if (selectedQty > currentStock) {
      // This state is technically unreachable if the button is disabled,
      // but it's good practice.
      return; 
    }
    onUpdateQuantity(item._id, selectedQty);
  };

  return (
    <div className="modal qty-modal-overlay" onClick={onClose}>
      <div className="modal-content qty-modal-content" onClick={e => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h3>Select Quantity for {item.product?.name || 'Item'}</h3>

        {/* 1. REMOVED the "Available Stock: X" text. */}

        {/* 2. ADDED conditional low stock warning. */}
        {showLowStockWarning && (
          <p className="stock-limit-info low-stock-warning">
            <i className="fa-solid fa-triangle-exclamation"></i> Only {currentStock} items remaining!
          </p>
        )}

        <div className="qty-selector">
          <select
            value={selectedQty}
            onChange={(e) => setSelectedQty(Number(e.target.value))}
          >
            {/* 3. Generate options up to the new 'dropdownOptionCount'. */}
            {[...Array(dropdownOptionCount)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* This error message will now only appear if stock is 0.
          (Dropdown shows '1', selectedQty is 1, currentStock is 0).
          This is correct behavior.
        */}
        {selectedQty > currentStock && (
          <p className="error-text">Only {currentStock} items remaining in stock.</p>
        )}

        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          {/* 4. The 'disabled' check now correctly compares against the REAL stock. */}
          <button
            className="cta-button"
            onClick={handleConfirm}
            disabled={selectedQty > currentStock} // This is the main safeguard
          >
            Update Quantity
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelectionModal;