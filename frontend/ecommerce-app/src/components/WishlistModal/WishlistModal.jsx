import React from 'react';
import WishlistItemCard from '../WishlistItemCard/WishlistItemCard';
import './WishlistModal.css';

// 1. Add `showNotification` to the props list here
const WishlistModal = ({ isOpen, onClose, items, onRemoveItem, onMoveItemToCart, showNotification }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="wishlist-modal-content" onClick={e => e.stopPropagation()}>
                <div className="wishlist-header">
                    <h2>My Wishlist ({items.length})</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="wishlist-body">
                    {items.length > 0 ? (
                        <div className="wishlist-grid">
                            {items.map(product => (
                                <WishlistItemCard 
                                    key={product._id} 
                                    product={product} 
                                    onRemove={onRemoveItem}
                                    onMoveToCart={onMoveItemToCart}
                                    showNotification={showNotification} // <-- 2. ADD THIS LINE
                                />
                            ))}
                        </div>
                    ) : (
                       <div className="empty-wishlist">
                           <h3>Your Wishlist is Empty</h3>
                           <p>Looks like you haven't added anything yet.</p>
                           <button className="continue-shopping-btn" onClick={onClose}>
                               Continue Shopping
                           </button>
                       </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WishlistModal;