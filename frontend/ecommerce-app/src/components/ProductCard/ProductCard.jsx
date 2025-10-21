import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/authAPI';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const getRatingClass = (r) => {
    if (r >= 4) return 'rating-excellent';
    if (r >= 3) return 'rating-good';
    if (r >= 2) return 'rating-mid';
    return 'rating-low';
  };

  return (
    <div className={`stars-wrapper-small ${getRatingClass(rating)}`}>
      {[...Array(fullStars)].map((_, i) => (
        <i key={`f-${i}`} className="fas fa-star"></i>
      ))}
      {halfStar && <i key="h" className="fas fa-star-half-alt"></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`e-${i}`} className="far fa-star"></i>
      ))}
    </div>
  );
};

const ProductCard = ({ product, showNotification, onQuickView }) => {
  const { user, cart, addToCart, wishlist, setWishlist } = useAuth();
  const navigate = useNavigate();

  // ADD NULL CHECKS HERE - This is the main fix
  const displayVariant = product?.variants?.[0];

  const isWishlisted = useMemo(
    () => wishlist.some((item) => item?._id === product?._id),
    [wishlist, product],
  );
  
  const totalStock = useMemo(
    () =>
      displayVariant?.stockBySize?.reduce((sum, size) => sum + size.stock, 0) ||
      0,
    [displayVariant],
  );
  
  const discountPercentage = useMemo(() => {
    if (!displayVariant || displayVariant.originalPrice <= displayVariant.price)
      return 0;
    return Math.round(
      ((displayVariant.originalPrice - displayVariant.price) /
        displayVariant.originalPrice) *
        100,
    );
  }, [displayVariant]);

  const needsOptions = useMemo(() => {
    if (!displayVariant) return false;
    return product?.variants?.length > 1 || displayVariant?.stockBySize?.length > 1;
  }, [product, displayVariant]);

  const itemInCart = useMemo(() => {
    if (!displayVariant) return null;
    return cart.find((item) => item.product?._id === product?._id);
  }, [cart, product, displayVariant]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showNotification('Please login to manage your wishlist.', 'info');
      return;
    }
    try {
      const response = isWishlisted
        ? await authAPI.removeFromWishlist(product._id)
        : await authAPI.addToWishlist(product._id);
      setWishlist(response.wishlist);
    } catch (error) {
      console.error('Failed to update wishlist', error);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showNotification('Please login to add items to your cart.', 'info');
      return;
    }
    if (itemInCart) {
      navigate('/checkout');
      return;
    }

    if (needsOptions) {
      onQuickView(product);
      return;
    }

    if (displayVariant) {
      const firstAvailableSize = displayVariant.stockBySize?.find(
        (s) => s.stock > 0,
      );
      if (firstAvailableSize) {
        const result = await addToCart({
          productId: product._id,
          variantName: displayVariant.name,
          size: firstAvailableSize.size,
          quantity: 1,
        });
        if (result.success) {
          showNotification(`${product.name} added to cart!`, 'success');
        } else {
          showNotification(
            result.message || 'Could not add item to cart.',
            'error',
          );
        }
      } else {
        showNotification('This product is out of stock.', 'error');
      }
    }
  };

  // ADD EARLY RETURN IF PRODUCT OR VARIANT IS INVALID
  if (!product || !displayVariant) {
    console.warn('Invalid product data in ProductCard:', product);
    return null; // This prevents the error
  }

  return (
    <div className="product-card-wrapper">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card">
          <div className="product-image">
            <img src={displayVariant.images?.[0]?.url} alt={product.name} />

            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
            >
              <i className={isWishlisted ? 'fas fa-heart' : 'far fa-heart'}></i>
            </button>

            {discountPercentage > 0 && (
              <span className="discount-badge">{discountPercentage}% OFF</span>
            )}
          </div>

          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="artisan-name">by {product.artisan?.name}</p>

            <div className="product-rating-row">
              <StarRating rating={product.rating} />
              <span className="rating-count">({product.ratingCount || 0})</span>
            </div>

            <div className="product-price">
              <span className="current-price">
                Rs. {displayVariant.price?.toLocaleString()}
              </span>
              {discountPercentage > 0 && (
                <span className="original-price">
                  Rs. {displayVariant.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>

            <div className="product-meta">
              {product.variants?.length > 1 && (
                <p className="variant-count">
                  {product.variants.length} colors available
                </p>
              )}

              {totalStock > 0 && totalStock <= 5 && (
                <p className="low-stock-warning">Only {totalStock} left!</p>
              )}
            </div>
            <button
              className={`add-to-cart-btn ${itemInCart ? 'go-to-cart' : ''}`}
              onClick={handleAddToCartClick}
              disabled={totalStock === 0}
            >
              {totalStock === 0
                ? 'Out of Stock'
                : itemInCart
                ? 'Go to Cart'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;