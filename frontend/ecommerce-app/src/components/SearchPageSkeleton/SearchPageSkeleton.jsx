import React from 'react';
import './SearchPageSkeleton.css';

const Shimmer = () => <div className="shimmer-wrapper"><div className="shimmer"></div></div>;

const FilterSkeleton = () => (
    <div className="filter-skeleton">
        <div className="filter-title-skeleton"><Shimmer /></div>
        {[...Array(4)].map((_, i) => (
            <div className="filter-option-skeleton" key={i}>
                <div className="checkbox-skeleton"><Shimmer /></div>
                <div className="label-skeleton"><Shimmer /></div>
            </div>
        ))}
    </div>
);

const ProductCardSkeleton = () => (
    <div className="product-card-skeleton">
        <div className="image-skeleton"><Shimmer /></div>
        <div className="info-skeleton">
            <div className="line-skeleton short"><Shimmer /></div>
            <div className="line-skeleton long"><Shimmer /></div>
        </div>
    </div>
);

const SearchPageSkeleton = () => {
    return (
        <div className="categories-page search-page-skeleton">
            <div className="categories-container">
                <aside className="filters-sidebar-skeleton">
                    <FilterSkeleton />
                    <FilterSkeleton />
                </aside>
                <main className="products-main-skeleton">
                    <div className="header-skeleton">
                        <div className="breadcrumb-skeleton"><Shimmer /></div>
                        <div className="controls-skeleton"><Shimmer /></div>
                    </div>
                    <div className="products-grid-skeleton">
                        {[...Array(10)].map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SearchPageSkeleton;
