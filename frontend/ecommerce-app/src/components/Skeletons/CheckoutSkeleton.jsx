import React from 'react';
import './Skeletons.css';

const CartItemSkeleton = () => (
    <div className="cart-item-skeleton">
        <div className="cart-item-image-skeleton skeleton-block" />
        <div className="cart-item-details-skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
            <div className="skeleton-line medium" style={{ marginTop: '1rem' }} />
        </div>
    </div>
);

const CheckoutSkeleton = () => {
    return (
        <div className="checkout-page-container skeleton">
            <main className="checkout-main-content">
                <div className="checkout-grid">
                    <div className="checkout-left-column">
                        <div className="address-skeleton skeleton-block" />
                        <CartItemSkeleton />
                        <CartItemSkeleton />
                    </div>
                    <div className="checkout-right-column">
                        <div className="price-details-skeleton skeleton-block" />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutSkeleton;