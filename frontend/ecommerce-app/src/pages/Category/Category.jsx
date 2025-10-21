import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productAPI } from '../../services/productAPI';
import ProductCard from '../../components/ProductCard/ProductCard';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import ProductCardSkeleton from '../../components/ProductCardSkeleton/ProductCardSkeleton';
import QuickViewModal from '../../components/QuickViewModal/QuickViewModal';
import BackToTopButton from '../../components/BackToTopButton/BackToTopButton';
import { shopAPI } from '../../services/shopAPI';
import './Category.css';

const Category = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [debouncedPrice, setDebouncedPrice] = useState({ min: '', max: '' });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    material: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const observer = useRef();
  const loaderRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          pagination.currentPage < pagination.totalPages
        ) {
          setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, pagination],
  );

   useEffect(() => {
    // This command instantly scrolls the window to the very top
    window.scrollTo(0, 0); 
  }, [slug]); 

  useEffect(() => {
    const initializeCategories = async () => {
      try {
        const fetchedCategories = await shopAPI.getFeaturedCategories();
        setAllCategories(fetchedCategories);
        console.log('Fetched categories:', fetchedCategories);

        const fetchedSlugs = fetchedCategories.map((cat) => cat.slug);
        if (fetchedSlugs.includes(slug)) {
          setSelectedCategories([slug]);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    initializeCategories();
  }, [slug]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, filters, debouncedPrice]);

  useEffect(() => {
    const fetchAvailableFilters = async () => {
      if (selectedCategories.length > 0) {
        try {
          const response = await productAPI.getAvailableFilters(
            selectedCategories,
          );
          if (response.success) {
            setAvailableMaterials(response.filters.materials);
          }
        } catch (error) {
          console.error('Failed to fetch dynamic filters:', error);
        }
      } else {
        setAvailableMaterials([]);
      }
    };

    fetchAvailableFilters();
  }, [selectedCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
      setProducts([]);
      setFilters((prev) => ({ ...prev, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange]);

  const fetchProducts = async (isNewFilter = false) => {
    setLoading(true);
    try {
      if (selectedCategories.length === 0) {
        setProducts([]);
        return;
      }
      const [primary, ...others] = selectedCategories;
      const params = {
        ...filters,
        minPrice: debouncedPrice[0],
        maxPrice: debouncedPrice[1],
        categories: others.join(','),
      };

      const response = await productAPI.getProductsByCategory(primary, params);
      if (response.success) {
        setProducts((prev) =>
          isNewFilter ? response.products : [...prev, ...response.products],
        );
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalProducts: response.totalProducts,
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };
  const generateBreadcrumbTitle = () => {
    const count = selectedCategories.length;
    if (count === 0) return 'All Products';
    if (count === 1) return getCategoryTitle(selectedCategories[0]);

    const titles = selectedCategories.map(getCategoryTitle);
    if (count === 2) return titles.join(' and ');
    if (count === 3) return `${titles[0]}, ${titles[1]} and ${titles[2]}`;

    return `${count} Categories Selected`;
  };

  const handleCategoryToggle = (catSlug) => {
    const newSelection = selectedCategories.includes(catSlug)
      ? selectedCategories.filter((c) => c !== catSlug)
      : [...selectedCategories, catSlug];
    setSelectedCategories(newSelection);
    setProducts([]);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split(':');
    setProducts([]);
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const getCategoryTitle = (slug) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="categories-page">
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
      <div className="categories-container">
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">FILTER BY PRICE</h3>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((p) => ({ ...p, min: e.target.value }))
                }
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((p) => ({ ...p, max: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">MATERIAL</h3>
            <select
              className="material-select"
              value={filters.material}
              onChange={(e) =>
                setFilters((f) => ({ ...f, material: e.target.value, page: 1 }))
              }
            >
              <option value="all">Any Material</option>
              {availableMaterials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <h3 className="filter-title">CATEGORIES</h3>
            <div className="category-options">
              {allCategories.map((category) => (
                <label key={category.slug} className="category-option">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.slug)}
                    onChange={() => handleCategoryToggle(category.slug)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <main className="products-main">
          <div className="products-header">
            <nav className="breadcrumb">
              <Link to="/">Home</Link> /{' '}
              <span>{generateBreadcrumbTitle()}</span>
            </nav>
            <p>
              Showing {products.length} of {pagination.totalProducts} products
            </p>
            <div className="sort-options">
              <select
                className="sort-select"
                onChange={handleSortChange}
                value={`${filters.sortBy}:${filters.sortOrder}`}
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="rating:desc">Highest Rated</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
  {loading ? (
    Array.from({ length: filters.limit }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))
  ) : products.length > 0 ? (
    products.map((product) => {
      // ADD THIS SAFETY CHECK
      if (!product || !product.variants || !product.variants[0]) {
        console.warn('Skipping invalid product in Category:', product);
        return null;
      }
      return (
        <ProductCard
          key={product._id}
          product={product}
          showNotification={showNotification}
          onQuickView={setQuickViewProduct}
        />
      );
    })
  ) : (
    <div className="no-products">
      <h3>No Products Found</h3>
      <p>
        Try adjusting your filters or selecting different categories.
      </p>
    </div>
  )}
</div>

          <div ref={loaderRef} className="infinite-scroll-loader">
            {loading && filters.page > 1 && (
              <div className="loading-spinner-small"></div>
            )}
            {!loading &&
              pagination.currentPage === pagination.totalPages &&
              products.length > 0 && (
                <p className="end-of-results">
                  You've reached the end of the results.
                </p>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;
