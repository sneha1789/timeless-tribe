import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import {
  InstantSearch,
  Hits,
  Configure,
} from 'react-instantsearch-dom';
import ProductCard from '../ProductCard/ProductCard'; // Assuming ProductCard is in this path
import './BestsellerRecommendations.css';

// We need to initialize the search client again within this component
const APP_ID = process.env.REACT_APP_ALGOLIA_APP_ID;
const SEARCH_KEY = process.env.REACT_APP_ALGOLIA_SEARCH_ONLY_KEY;
const searchClient = APP_ID && SEARCH_KEY ? algoliasearch(APP_ID, SEARCH_KEY) : null;

// This is a simplified Hit component for recommendations
const RecommendationHit = ({ hit, showNotification, onQuickView }) => {
    const product = { ...hit, _id: hit.objectID };
    return <ProductCard product={product} showNotification={showNotification} onQuickView={onQuickView} />;
};

const BestsellerRecommendations = ({ showNotification, onQuickView }) => {
  if (!searchClient) return null;

  return (
    // This component has its own independent InstantSearch instance
    <InstantSearch
      searchClient={searchClient}
      indexName="products_rating_desc" // We target the "Highest Rated" replica
    >
      {/* Configure tells Algolia what we want */}
      <Configure
        hitsPerPage={5} // Fetch the top 5 products
        query=""          // with an empty query to get all items
      />
      <div className="recommendations-grid">
        <Hits hitComponent={(props) => <RecommendationHit {...props} showNotification={showNotification} onQuickView={onQuickView} />} />
      </div>
    </InstantSearch>
  );
};

export default BestsellerRecommendations;
