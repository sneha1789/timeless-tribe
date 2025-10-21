import React from 'react';
import './Skeletons.css'; // We'll use a shared CSS file for the animation

const ProductDetailSkeleton = () => {
    return (
        <div className="product-detail-page">
            <main className="product-page-container skeleton">
                <div className="breadcrumb-skeleton skeleton-line short" />
                <section className="product-main-grid">
                    <div className="product-gallery-skeleton">
                        <div className="main-image-skeleton skeleton-block" />
                        <div className="thumbnail-gallery-skeleton">
                            <div className="thumb-skeleton skeleton-block" />
                            <div className="thumb-skeleton skeleton-block" />
                            <div className="thumb-skeleton skeleton-block" />
                            <div className="thumb-skeleton skeleton-block" />
                        </div>
                    </div>
                    <div className="product-info-skeleton">
                        <div className="skeleton-line h1" />
                        <div className="skeleton-line short" />
                        <div className="skeleton-line medium" />
                        <div className="skeleton-line price" />
                        <div className="skeleton-line short" style={{ marginTop: '2rem' }} />
                        <div className="swatches-skeleton">
                            <div className="swatch-skeleton skeleton-block" />
                            <div className="swatch-skeleton skeleton-block" />
                        </div>
                        <div className="skeleton-line short" style={{ marginTop: '1rem' }} />
                        <div className="sizes-skeleton">
                            <div className="size-skeleton skeleton-block" />
                            <div className="size-skeleton skeleton-block" />
                            <div className="size-skeleton skeleton-block" />
                            <div className="size-skeleton skeleton-block" />
                        </div>
                        <div className="buttons-skeleton">
                            <div className="button-skeleton skeleton-block" />
                            <div className="button-skeleton skeleton-block" />
                            <div className="button-skeleton skeleton-block" />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductDetailSkeleton;