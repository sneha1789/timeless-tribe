import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  Pagination,
  Stats,
  SortBy,
  RefinementList,
  ClearRefinements,
  connectStateResults,
  connectRange,
  connectCurrentRefinements,
  Configure,
} from 'react-instantsearch-dom';

import BackToTopButton from '../../components/BackToTopButton/BackToTopButton';
import ProductCard from '../../components/ProductCard/ProductCard';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import SearchPageSkeleton from '../../components/SearchPageSkeleton/SearchPageSkeleton';
import BestsellerRecommendations from '../../components/BestsellerRecommendations/BestsellerRecommendations';
import '../Category/Category.css';

const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID;
const SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_ONLY_KEY;
const searchClient =
  APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;

const PriceSlider = ({ min, max, currentRefinement, refine }) => {
  const sliderMin = min || 0;
  const sliderMax = max || 10000;

  const [minValue, setMinValue] = useState(currentRefinement.min ?? sliderMin);
  const [maxValue, setMaxValue] = useState(currentRefinement.max ?? sliderMax);

  useEffect(() => {
    if (
      currentRefinement.min === undefined &&
      currentRefinement.max === undefined
    ) {
      setMinValue(sliderMin);
      setMaxValue(sliderMax);
    }
  }, [currentRefinement, sliderMin, sliderMax]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxValue - 100);
    setMinValue(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minValue + 100);
    setMaxValue(value);
  };

  const applyFilters = () => {
    refine({ min: minValue, max: maxValue });
  };

  return (
    <div className="price-slider-modern">
      <div className="slider-header">
        <span className="price-range-display">
          Rs. {minValue.toLocaleString()} - Rs. {maxValue.toLocaleString()}
        </span>
      </div>

      <div className="dual-slider-container">
        <div className="slider-track">
          <div
            className="slider-progress"
            style={{
              left: `${
                ((minValue - sliderMin) / (sliderMax - sliderMin)) * 100
              }%`,
              width: `${
                ((maxValue - minValue) / (sliderMax - sliderMin)) * 100
              }%`,
            }}
          ></div>
        </div>

        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          value={minValue}
          onChange={handleMinChange}
          onMouseUp={applyFilters}
          onTouchEnd={applyFilters}
          className="slider-input min-slider"
        />

        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          value={maxValue}
          onChange={handleMaxChange}
          onMouseUp={applyFilters}
          onTouchEnd={applyFilters}
          className="slider-input max-slider"
        />
      </div>

      <div className="slider-limits">
        <span>Rs. {sliderMin.toLocaleString()}</span>
        <span>Rs. {sliderMax.toLocaleString()}</span>
      </div>
    </div>
  );
};
const ConnectedPriceSlider = connectRange(PriceSlider);

const CurrentRefinements = ({ items, refine }) => {
  const categoryRefinement = items.find(
    (item) => item.attribute === 'category',
  );

  const priceRefinement = items.find((item) => item.attribute === 'price');

  return (
    <div className="current-refinements">
      {/* Map over the nested items of the single category object */}
      {categoryRefinement &&
        categoryRefinement.items.map((nestedItem) => (
          <button
            key={nestedItem.label}
            className="refinement-pill"
            onClick={() => refine(nestedItem.value)}
          >
            <span>{`Category: ${nestedItem.label}`}</span>
            <span className="remove-icon">ⓧ</span>
          </button>
        ))}

      {/* Render a single pill for the price range if it exists */}
      {priceRefinement && (
        <button
          className="refinement-pill"
          onClick={() => refine(priceRefinement.value)}
        >
          <span>{`Price: ${priceRefinement.currentRefinement.min} - ${priceRefinement.currentRefinement.max}`}</span>
          <span className="remove-icon">ⓧ</span>
        </button>
      )}
    </div>
  );
};
const ConnectedCurrentRefinements =
  connectCurrentRefinements(CurrentRefinements);

const NoResults = connectStateResults(
  ({ searchResults, searching, showNotification, onQuickView }) => {
    if (searching || !searchResults || searchResults.nbHits > 0) return null;

    const query = searchResults.query;
    const typoSuggestion = searchResults._rawResults[0]?.hits.find(
      (h) => h.query,
    )?.query;

    return (
      <div className="no-results-container">
        <h3>No results found for "{query}"</h3>
        {typoSuggestion && (
          <p>
            Did you mean:{' '}
            <Link to={`/search?q=${encodeURIComponent(typoSuggestion)}`}>
              {typoSuggestion}
            </Link>
            ?
          </p>
        )}
        <div className="recommendations">
          <h4>Here are some of our best sellers:</h4>
          {/* The hardcoded links are gone, replaced by our dynamic component */}
          <BestsellerRecommendations
            showNotification={showNotification}
            onQuickView={onQuickView}
          />
        </div>
      </div>
    );
  },
);

const Hit = ({ hit, showNotification, onQuickView }) => {
  const product = { ...hit, _id: hit.objectID };
  return (
    <ProductCard
      product={product}
      showNotification={showNotification}
      onQuickView={onQuickView}
    />
  );
};

const SearchPage = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  if (loading) {
    return <SearchPageSkeleton />;
  }

  if (!searchClient) {
    return <div className="full-page-error">Search is not configured.</div>;
  }

  return (
    <div className="categories-page search-page">
      <BackToTopButton />

      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          showNotification={showNotification}
        />
      )}

      {/* --- FIX: We add a `key` to force InstantSearch to re-mount when the query changes --- */}
      {/* This ensures that if you search for "A", then go back and search for "B", the component resets correctly. */}
      <InstantSearch
        searchClient={searchClient}
        indexName="products"
        key={searchQuery}
      >
        {/* --- FIX: Use the Configure component to set the search query --- */}
        <Configure query={searchQuery} hitsPerPage={20} />

        <div className="categories-container">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <ClearRefinements />
            </div>
            <div className="filter-group">
              <h3 className="filter-title">CATEGORY</h3>
              <RefinementList attribute="category" />
            </div>
            <div className="filter-group">
              <h3 className="filter-title">PRICE RANGE</h3>
              <ConnectedPriceSlider attribute="price" />
            </div>
          </aside>
          <main className="products-main">
            <div className="products-header">
              <nav className="breadcrumb">
                <Link to="/">Home</Link> / <span>Search</span>
                {searchQuery && <span>: "{searchQuery}"</span>}
              </nav>
              <div className="search-results-info">
                <Stats />
                <SortBy
                  defaultRefinement="products_newest"
                  items={[
                    { value: 'products_newest', label: 'Newest First' },
                    { value: 'products', label: 'Relevance' },
                    { value: 'products_rating_desc', label: 'Highest Rated' },
                    {
                      value: 'products_price_asc',
                      label: 'Price: Low to High',
                    },
                    {
                      value: 'products_price_desc',
                      label: 'Price: High to Low',
                    },
                  ]}
                />
              </div>
            </div>

            <ConnectedCurrentRefinements />

            <div className="products-grid">
              <Hits
                hitComponent={(props) => (
                  <Hit
                    {...props}
                    showNotification={showNotification}
                    onQuickView={setQuickViewProduct}
                  />
                )}
              />
              {/* ... and update this line */}
              <NoResults
                showNotification={showNotification}
                onQuickView={setQuickViewProduct}
              />
            </div>

            <div className="pagination">
              <Pagination />
            </div>
          </main>
        </div>
      </InstantSearch>
    </div>
  );
};

export default SearchPage;
