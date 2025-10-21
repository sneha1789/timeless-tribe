// src/components/ProductCardSkeleton/ProductCardSkeleton.jsx
import React from 'react';
import './ProductCardSkeleton.css';

const ProductCardSkeleton = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line medium"></div>
                <div className="skeleton-line long"></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;