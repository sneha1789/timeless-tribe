import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI, addressAPI, reviewAPI } from '../../services/productAPI';
import { shopAPI } from '../../services/shopAPI';
import { authAPI } from '../../services/authAPI';
import ConfirmPopup from '../../components/Popups/ConfirmPopup';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import LoadingPopup from '../../components/Popups/LoadingPopup';
import { useAuth } from '../../context/AuthContext';
import SizeChartModal from '../../components/Modals/SizeChartModal';
import ProductDetailSkeleton from '../../components/Skeletons/ProductDetailSkeleton';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ProductDetail.css';

const ProductDetail = () => {
  const { user, setShowLoginModal, wishlist, setWishlist, cart, addToCart } =
    useAuth();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [settings, setSettings] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [shakeStockMessage, setShakeStockMessage] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [reviewToUpdate, setReviewToUpdate] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [reviewForm, setReviewForm] = useState({ title: '', comment: '' });
  const [selectedRating, setSelectedRating] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [reviewDropdown, setReviewDropdown] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showSizeChartModal, setShowSizeChartModal] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const fileInputRef = useRef(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (user && reviews.length > 0) {
      const initialVotes = {};
      reviews.forEach((review) => {
        const userVote = review.voters?.find((v) => v.userId === user._id);
        if (userVote) {
          initialVotes[review._id] = userVote.vote;
        }
      });
      setUserVotes(initialVotes);
    }
  }, [user, reviews]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setProduct(null);
        setSelectedVariant(null);
        setSelectedSize(null);

        const [productResponse, offersData, settingsData] = await Promise.all([
          productAPI.getProduct(slug),
          shopAPI.getOffersWithoutImages(),
          shopAPI.getSettings(),
        ]);

        setOffers(offersData || []);
        setSettings(settingsData || { freeShippingThreshold: 2000 });

        if (productResponse.success && productResponse.product) {
          const currentProduct = productResponse.product;
          setProduct(currentProduct);

          if (currentProduct.variants && currentProduct.variants.length > 0) {
            const defaultVariant = currentProduct.variants[0];
            setSelectedVariant(defaultVariant);
            const firstAvailableSize = defaultVariant.stockBySize.find(
              (s) => s.stock > 0,
            );
            setSelectedSize(
              firstAvailableSize ? firstAvailableSize.size : null,
            );
          }

          const reviewsResponse = await reviewAPI.getProductReviews(
            currentProduct._id,
          );
          if (reviewsResponse.success) {
            setReviews(reviewsResponse.reviews);
          }

          const similarData = await productAPI.getSimilarProducts(
            currentProduct.category,
            currentProduct.slug,
          );

          if (similarData && Array.isArray(similarData.products)) {
            setSimilarProducts(similarData.products);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('Failed to load product data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);
    fetchData();
  }, [slug]);
  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getAddresses();
          if (response.addresses && response.addresses.length > 0) {
            setAddresses(response.addresses);
            const defaultAddress =
              response.addresses.find((addr) => addr.isDefault) ||
              response.addresses[0];
            setSelectedAddress(defaultAddress);
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
        }
      }
    };
    fetchAddresses();
  }, []);

  const getRatingClass = (rating) => {
    if (rating >= 4) return 'rating-excellent';
    if (rating >= 3) return 'rating-good';
    if (rating >= 2) return 'rating-mid';
    if (rating > 0) return 'rating-low';
    return 'rating-none';
  };

  const StarRating = ({ rating, ratingCount }) => {
    if (ratingCount === 0) {
      return <span className="no-ratings-text">No Ratings Yet</span>;
    }

    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const ratingClass = getRatingClass(rating);

    return (
      <div className={`stars-wrapper ${ratingClass}`}>
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fa-solid fa-star"></i>
        ))}
        {halfStar && <i key="half" className="fa-solid fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="fa-regular fa-star"></i>
        ))}

        {ratingCount > 0 && (
          <span className="rating-count-text">
            {`| ${ratingCount} ${ratingCount > 1 ? 'Ratings' : 'Rating'}`}
          </span>
        )}
      </div>
    );
  };

  const isItemInCart = React.useMemo(() => {
    if (!cart || !selectedVariant || !selectedSize) return false;

    return cart.some(
      (item) =>
        item.product?._id === product._id &&
        item.variantName === selectedVariant.name &&
        item.size === selectedSize,
    );
  }, [cart, product, selectedVariant, selectedSize]);

  const sortedReviews = React.useMemo(() => {
    if (!reviews || reviews.length === 0) return [];

    const currentUserReview = user
      ? reviews.find((r) => r.user === user._id)
      : null;
    const otherReviews = reviews.filter((r) => !user || r.user !== user._id);

    otherReviews.sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return currentUserReview
      ? [currentUserReview, ...otherReviews]
      : otherReviews;
  }, [reviews, user]);

  const allCustomerPhotos = React.useMemo(() => {
    return reviews.flatMap((review) => review.images || []);
  }, [reviews]);

  const verifiedBuyerCount = React.useMemo(() => {
    return reviews.filter((r) => r.isVerified).length;
  }, [reviews]);

  const isWishlisted = React.useMemo(() => {
    return wishlist?.some((item) => item?._id === product?._id);
  }, [wishlist, product]);
  const calculateRatingDistribution = () => {
    const distribution = [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ];

    if (!reviews || reviews.length === 0) return distribution;

    reviews.forEach((review) => {
      const rating = Math.floor(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[5 - rating].count++;
      }
    });

    const totalReviewsWithRatings = distribution.reduce(
      (sum, item) => sum + item.count,
      0,
    );

    return distribution.map((item) => ({
      ...item,
      percentage:
        totalReviewsWithRatings > 0
          ? (item.count / totalReviewsWithRatings) * 100
          : 0,
    }));
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      let response;
      if (isWishlisted) {
        response = await authAPI.removeFromWishlist(product._id);
        showNotification('Removed from wishlist', 'success');
      } else {
        response = await authAPI.addToWishlist(product._id);
        showNotification('Added to wishlist', 'success');
      }

      setWishlist(response.wishlist);
    } catch (error) {
      showNotification(error.message || 'Failed to update wishlist', 'error');
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
    const firstAvailableSize = variant.stockBySize.find((s) => s.stock > 0);
    setSelectedSize(firstAvailableSize ? firstAvailableSize.size : null);
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleOpenAddressModal = () => {
    setShowAddressModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    document.body.style.overflow = 'auto';
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    handleCloseAddressModal();
  };

  const handleAddNewAddress = () => {
    navigate('/profile?section=addresses-section');
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!product || !selectedVariant || !selectedSize) {
      showNotification('Please select an available size.', 'error');
      return;
    }
    const sizeInfo = selectedVariant.stockBySize.find(
      (s) => s.size === selectedSize,
    );
    if (!sizeInfo || sizeInfo.stock <= 0) {
      showNotification('This size is out of stock.', 'error');
      return;
    }

    const cartItemData = {
      productId: product._id,
      variantName: selectedVariant.name,
      size: selectedSize,
      quantity: 1,
    };

    const result = await addToCart(cartItemData);
    if (result.success) {
      showNotification(
        `${product.name} (${selectedVariant.name}) added to cart!`,
        'success',
      );
    } else {
      showNotification(
        result.message || 'Could not add item to cart.',
        'error',
      );
    }
  };

  const handleViewSizeChart = () => {
    setShowSizeChartModal(true);
  };
  const handleBuyNow = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const cartItemData = {
      productId: product._id,
      variantName: selectedVariant.name,
      size: selectedSize,
      quantity: 1,
    };

    const result = await addToCart(cartItemData);

    if (result.success) {
      navigate('/checkout');
    } else {
      showNotification(result.message || 'Could not process order.', 'error');
    }
  };

  const handleGoToCart = () => {
    navigate('/checkout');
  };
  const handleOpenReviewModal = (reviewToEdit = null) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (reviewToEdit) {
      setIsUpdatingReview(true);
      setReviewToUpdate(reviewToEdit);
      setReviewForm({
        title: reviewToEdit.title,
        comment: reviewToEdit.comment,
      });
      setSelectedRating(reviewToEdit.rating);

      setUploadedPhotos(
        (reviewToEdit.images || []).map((url) => ({ url, file: null })),
      );
    } else {
      setIsUpdatingReview(false);
      setReviewToUpdate(null);
      setReviewForm({ title: '', comment: '' });
      setSelectedRating(0);
      setUploadedPhotos([]);
    }
    setShowReviewModal(true);
    setReviewDropdown(null);
  };
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setIsUpdatingReview(false);
    setReviewToUpdate(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (selectedRating === 0)
      return showNotification('Please select a star rating.', 'error');

    setIsLoading(true);
    setLoadingText(
      isUpdatingReview ? 'Updating Review...' : 'Submitting Review...',
    );

    const formData = new FormData();
    formData.append('rating', selectedRating);
    formData.append('title', reviewForm.title);
    formData.append('comment', reviewForm.comment);

    uploadedPhotos.forEach((photo) => {
      if (photo.file) {
        formData.append('images', photo.file);
      } else if (photo.url) {
        formData.append('existingImages', photo.url);
      }
    });

    try {
      if (isUpdatingReview) {
        const response = await reviewAPI.updateReview(
          reviewToUpdate._id,
          formData,
        );

        if (response.success) {
          const updatedReviewFromServer = response.review;

          setReviews((prevReviews) =>
            prevReviews.map((review) =>
              review._id === updatedReviewFromServer._id
                ? updatedReviewFromServer
                : review,
            ),
          );
          showNotification('Review updated successfully!', 'success');
        }
      } else {
        const response = await reviewAPI.addReview(product._id, formData);

        if (response.success) {
          setReviews([response.review, ...reviews]);
          showNotification('Thank you for your review!', 'success');
        }
      }
      handleCloseReviewModal();
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification(error.message || 'Failed to submit review', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLightbox = (imagesToShow, startIndex = 0) => {
    const imageUrls = imagesToShow.map((img) =>
      typeof img === 'object' ? img.url : img,
    );
    setLightboxImages(imageUrls);
    setSelectedImage(startIndex);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'auto';
  };

  const handleNextImage = () => {
    const numImages = lightboxImages.length || 1;
    setSelectedImage((prev) => (prev + 1) % numImages);
  };

  const handlePrevImage = () => {
    const numImages = lightboxImages.length || 1;
    setSelectedImage((prev) => (prev - 1 + numImages) % numImages);
  };

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('File size too large. Maximum 5MB allowed.', 'error');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        showNotification('Only image files are allowed.', 'error');
        return false;
      }
      return true;
    });

    const newPhotos = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteReviewRequest = (reviewId) => {
    setReviewToDelete(reviewId);
    setReviewDropdown(null);
  };

  const executeDeleteReview = async () => {
    if (!reviewToDelete) return;

    setIsLoading(true);
    setLoadingText('Deleting Review...');

    try {
      const response = await reviewAPI.deleteReview(reviewToDelete);
      if (response.success) {
        setReviews(reviews.filter((r) => r._id !== reviewToDelete));
        showNotification('Review deleted successfully.', 'success');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showNotification(error.message || 'Failed to delete review', 'error');
    } finally {
      setReviewToDelete(null);

      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId, vote) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    const currentVote = userVotes[reviewId];

    try {
      const response = await reviewAPI.markReviewHelpful(
        reviewId,
        vote === 'helpful',
      );

      if (response.success) {
        setUserVotes((prev) => ({
          ...prev,
          [reviewId]: currentVote === vote ? null : vote,
        }));

        setReviews((prevReviews) =>
          prevReviews.map((review) => {
            if (review._id === reviewId) {
              return {
                ...review,
                helpful: response.helpfulCount,
                notHelpful: response.notHelpfulCount,
              };
            }
            return review;
          }),
        );
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
      showNotification(error.message || 'Failed to update vote', 'error');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.review-actions')) {
        setReviewDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showLightbox) {
        if (e.key === 'Escape') handleCloseLightbox();
        else if (e.key === 'ArrowLeft') handlePrevImage();
        else if (e.key === 'ArrowRight') handleNextImage();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, selectedImage]);

  const getCategoryTitle = (slug) => {
    const titles = {
      jewelry: 'Jewelry',
      'khukuri-brooch': 'Khukuri Brooch',
      'metal-statues': 'Metal Statues',
      'sound-and-spirituality': 'Sound & Spirituality',
      'thangka-and-wall-decor': 'Thangka & Wall Decor',
      'buddhist-ritual-object': 'Buddhist Ritual Objects',
      'wool-and-weave': 'Wool and Weave',
      'pashmina-scarf': 'Pashmina Scarves',
      'clothing-and-accessories': 'Clothes & Accessories',
      'gifts-and-souvenirs': 'Gifts & Souvenirs',
      'hemp-products': 'Hemp Products',
      'wooden-crafts': 'Wooden Crafts',
    };
    return (
      titles[slug] ||
      slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  const handleDisabledActionClick = () => {
    setShakeStockMessage(true);
    setTimeout(() => setShakeStockMessage(false), 500);
  };

  if (!product || !selectedVariant) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <h2>Product not found</h2>
          <Link to="/" className="cta-button">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  const allSizesToDisplay = (selectedVariant?.stockBySize || [])
    .map((s) => s.size)
    .sort((a, b) => {
      const order = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'];
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b, undefined, { numeric: true });
    });

  const discountPercentage =
    selectedVariant && selectedVariant.originalPrice > selectedVariant.price
      ? Math.round(
          ((selectedVariant.originalPrice - selectedVariant.price) /
            selectedVariant.originalPrice) *
            100,
        )
      : 0;

  const slidersettings = {
    dots: true,
    infinite: similarProducts.length > 3,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: 'linear',
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const totalVariantStock = selectedVariant.stockBySize.reduce(
    (acc, size) => acc + size.stock,
    0,
  );
  const isOutOfStock = totalVariantStock === 0;

  const currentSelectedSizeStock =
    selectedVariant.stockBySize.find((s) => s.size === selectedSize)?.stock ||
    0;

  return (
    <div className="product-detail-page">
      {isLoading && <LoadingPopup message={loadingText} />}

      {notification.message && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}

      {reviewToDelete && (
        <ConfirmPopup
          message="Are you sure you want to delete this review? This action cannot be undone."
          onConfirm={executeDeleteReview}
          onCancel={() => setReviewToDelete(null)}
        />
      )}

      {showSizeChartModal && (
        <SizeChartModal
          productName={product.name}
          sizeChart={product.sizeChart}
          onClose={() => setShowSizeChartModal(false)}
        />
      )}
      {showAddressModal && (
        <div className="modal address-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={handleCloseAddressModal}>
              &times;
            </span>
            <h2>Select Delivery Address</h2>
            <div className="addresses-list">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`address-card ${
                    selectedAddress?._id === address._id ? 'selected' : ''
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="address-card-header">
                    <span className="address-type">{address.name}</span>
                    {address.isDefault && (
                      <span className="default-badge">DEFAULT</span>
                    )}
                  </div>
                  <div className="address-details">
                    <strong>{address.fullName}</strong>
                    <p>
                      {address.street}, {address.area}, {address.city}
                    </p>
                    <p>Phone: {address.phone}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-add-new-address"
              onClick={handleAddNewAddress}
            >
              <i className="fa-solid fa-plus"></i> Add New Address
            </button>
          </div>
        </div>
      )}
      {showLightbox && (
        <div className="lightbox-modal" onClick={handleCloseLightbox}>
          <span className="close-lightbox" onClick={handleCloseLightbox}>
            &times;
          </span>
          <div
            className="lightbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="lightbox-nav prev" onClick={handlePrevImage}>
              &#10094;
            </button>
            <div className="lightbox-main-content">
              <img
                className="lightbox-image"
                src={lightboxImages[selectedImage]}
                alt={`View ${selectedImage + 1}`}
              />
            </div>
            <button className="lightbox-nav next" onClick={handleNextImage}>
              &#10095;
            </button>
          </div>
        </div>
      )}
      {showReviewModal && (
        <div className="modal" id="review-modal">
          <div className="modal-content review-modal-content">
            {/* Show loading popup inside the review modal when submitting */}
            {isLoading && <LoadingPopup message={loadingText} />}

            <span
              className="close-modal"
              onClick={handleCloseReviewModal}
              style={isLoading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              &times;
            </span>

            <h2>
              {isUpdatingReview ? 'Update Your Review' : 'Write Your Review'}
            </h2>
            <div className="modal-welcome">
              Share your experience with this product
            </div>

            <form
              id="review-form"
              onSubmit={handleReviewSubmit}
              style={isLoading ? { opacity: 0.6, pointerEvents: 'none' } : {}}
            >
              <div className="form-group">
                <label>
                  Your Rating <span className="required">*</span>
                </label>
                <div className="star-rating-input">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fa-${
                        i + 1 <= selectedRating ? 'solid' : 'regular'
                      } fa-star`}
                      onClick={() => !isLoading && handleStarClick(i + 1)}
                      style={{
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        color: i + 1 <= selectedRating ? '#f59e0b' : '#ccc',
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    ></i>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review-title">
                  Review Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="review-title"
                  placeholder="e.g., A Beautiful Piece of Art"
                  required
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="review-text">
                  Your Review <span className="required">*</span>
                </label>
                <textarea
                  id="review-text"
                  rows="4"
                  placeholder="Share your thoughts..."
                  required
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Add Photos (Optional)</label>
                <input
                  type="file"
                  id="review-photos-input"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <i className="fa-solid fa-camera"></i> Upload Images
                </button>
                <div id="photo-preview-container">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="photo-preview-item">
                      <img src={photo.url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-photo-btn"
                        onClick={() => !isLoading && handleRemovePhoto(index)}
                        disabled={isLoading}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="cta-button" disabled={isLoading}>
                {isUpdatingReview ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
      <main className="product-page-container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link> /{' '}
          <Link to={`/category/${product.category}`}>
            {getCategoryTitle(product.category)}
          </Link>{' '}
          / <span>{product.name}</span>
        </nav>
        <section className="product-main-grid">
          <div className="product-gallery">
            {/* --- MODIFIED: Images now come from the selectedVariant --- */}
            <div
              className="main-image-container"
              onClick={() =>
                handleOpenLightbox(selectedVariant?.images || [], selectedImage)
              }
            >
              <img
                src={selectedVariant?.images?.[selectedImage]?.url}
                alt={`${product.name} - ${selectedVariant?.name}`}
                className="main-product-image"
              />
            </div>
            <div className="thumbnail-gallery-horizontal">
              {selectedVariant?.images?.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail-item ${
                    selectedImage === index ? 'active' : ''
                  }`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="thumbnail-img"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="product-info-details">
            <h1 className="product-title">{product.name}</h1>
            <p className="artisan-byline">by {product.artisan?.name}</p>
            <div className="product-header-rating">
              <StarRating
                rating={product.rating}
                ratingCount={product.ratingCount}
              />
            </div>
            {/* --- MODIFIED: Price comes from selectedVariant --- */}

            <div className="product-price">
              <span className="current-price">
                Rs. {selectedVariant?.price.toLocaleString()}
              </span>
              {selectedVariant &&
                selectedVariant.originalPrice > selectedVariant.price && (
                  <>
                    <span className="original-price">
                      Rs. {selectedVariant.originalPrice.toLocaleString()}
                    </span>
                    <span className="discount-tag">
                      ({discountPercentage}% OFF)
                    </span>
                  </>
                )}
            </div>
            {product.variants && product.variants.length >=1  && (
              <div className="variant-selector">
                <h4>
                  Color: <span>{selectedVariant?.name}</span>
                </h4>
                <div className="variant-swatches">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.name}
                      className={`swatch ${
                        selectedVariant?.name === variant.name ? 'active' : ''
                      }`}
                      onClick={() => handleVariantSelect(variant)}
                      title={variant.name}
                    >
                      <img src={variant.swatchImage} alt={variant.name} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- END NEW --- */}
            {/* --- FIX 3: REFINED STOCK DISPLAY LOGIC --- */}
            <div className={`stock-info ${shakeStockMessage ? 'shake' : ''}`}>
              {isOutOfStock ? (
                <span className="stock-status out-of-stock">Out of Stock</span>
              ) : selectedSize &&
                currentSelectedSizeStock > 0 &&
                currentSelectedSizeStock <= 5 ? (
                <span className="stock-status low-stock">
                  Only {currentSelectedSizeStock} left!
                </span>
              ) : (
                <span className="stock-status in-stock">In Stock</span>
              )}
            </div>

            <div className="size-selector">
              <div className="size-selector-header">
                <h4>Select Size</h4>
                <button
                  className="btn-size-chart"
                  onClick={handleViewSizeChart}
                >
                  Size Chart <i className="fa-solid fa-ruler-horizontal"></i>
                </button>
              </div>
              <div className="size-options">
                {allSizesToDisplay.map((size) => {
                  const sizeInfo = selectedVariant?.stockBySize.find(
                    (s) => s.size === size,
                  );
                  const isDisabled = !sizeInfo || sizeInfo.stock <= 0;
                  return (
                    <button
                      key={size}
                      className={`size-btn ${
                        selectedSize === size ? 'active' : ''
                      } ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleSizeSelect(size)}
                      disabled={isDisabled}
                    >
                      {size}
                      {isDisabled && <span className="strikethrough"></span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="address-section">
              <div className="address-header">
                <h4>DELIVERY ADDRESS</h4>
                {addresses.length > 0 && (
                  <button
                    className="change-address-btn"
                    onClick={handleOpenAddressModal}
                  >
                    CHANGE
                  </button>
                )}
              </div>
              {selectedAddress ? (
                <div className="selected-address">
                  <div className="address-type-and-name">
                    <strong>{selectedAddress.fullName}</strong>
                    <span className="address-type-tag">
                      {selectedAddress.name}
                    </span>
                  </div>
                  <p className="address-full">
                    {selectedAddress.street}, {selectedAddress.area}
                    <br />
                    {selectedAddress.city}, Nepal
                  </p>
                  <p className="address-mobile">
                    Mobile: {selectedAddress.phone}
                  </p>
                </div>
              ) : (
                <div className="no-address">
                  <p>No address saved. Please add an address to continue.</p>
                  <button
                    className="btn-add-address"
                    onClick={handleAddNewAddress}
                  >
                    + Add Address
                  </button>
                </div>
              )}
            </div>
            <div className="action-buttons">
              {isItemInCart ? (
                <button
                  className="btn-add-to-bag go-to-cart"
                  onClick={handleGoToCart}
                >
                  <i className="fa-solid fa-arrow-right-to-bracket"></i> GO TO
                  CART
                </button>
              ) : (
                <button
                  className="btn-add-to-bag"
                  onClick={
                    isOutOfStock ? handleDisabledActionClick : handleAddToCart
                  }
                  disabled={isOutOfStock}
                >
                  <i className="fa-solid fa-shopping-bag"></i> ADD TO BAG
                </button>
              )}
              <button
                className="btn-buy-now"
                onClick={
                  isOutOfStock ? handleDisabledActionClick : handleBuyNow
                }
                disabled={isOutOfStock}
              >
                <i className="fa-solid fa-bolt"></i> BUY NOW
              </button>
              <button
                className={`btn-wishlist ${isWishlisted ? 'active' : ''}`}
                onClick={
                  isOutOfStock
                    ? handleDisabledActionClick
                    : handleToggleWishlist
                }
                disabled={isOutOfStock}
              >
                <i
                  className={`fa-${
                    isWishlisted ? 'solid' : 'regular'
                  } fa-heart`}
                ></i>
                {isWishlisted ? 'WISHLISTED' : 'WISHLIST'}
              </button>
            </div>
            <div className="info-section delivery-options">
              <h4>
                DELIVERY OPTIONS <i className="fa-solid fa-truck-fast"></i>
              </h4>
              {/* This check is now even safer because settings will never be null after loading */}
              {settings && (
                <p className="small-text">
                  Free delivery on orders over Rs.{' '}
                  {settings.freeShippingThreshold.toLocaleString()}. Cash on
                  Delivery available.
                </p>
              )}
            </div>
            {/* UPDATED BEST OFFERS */}
            <div className="info-section best-offers">
              <h4>
                BEST OFFERS <i className="fa-solid fa-tags"></i>
              </h4>
              <ul>
                {offers.map((offer) => (
                  <li key={offer._id}>
                    <i className="fa-solid fa-tag"></i>
                    <strong>{offer.title}:</strong> {offer.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="product-tabs-section">
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab-btn ${
                  activeTab === 'description' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                className={`tab-btn ${
                  activeTab === 'specifications' ? 'active' : ''
                }`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
            </div>
            <div
              className={`tab-content ${
                activeTab === 'description' ? 'active' : ''
              }`}
            >
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <h4>Why Choose This Product?</h4>
              <ul>
                <li>Handcrafted by skilled Nepali artisans</li>
                <li>Authentic traditional design</li>
                <li>Premium quality materials</li>
                <li>Fair trade practices</li>
                <li>Supports local craftsmanship</li>
              </ul>
            </div>
            <div
              className={`tab-content ${
                activeTab === 'specifications' ? 'active' : ''
              }`}
            >
              <h3>Product Specifications</h3>
              <div className="product-specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Material:</span>
                  <span className="spec-value">
                    {product.material || 'Various'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Artisan:</span>
                  <span className="spec-value">{product.artisan?.name}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">In Stock:</span>
                  <span className="spec-value">
                    {product.inStock ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Dimensions:</span>
                  <span className="spec-value">
                    {product.dimensions || 'Varies by size'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Weight:</span>
                  <span className="spec-value">
                    {product.weight || 'Lightweight'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Care:</span>
                  <span className="spec-value">Hand wash recommended</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="artisan-section">
          <h2 className="section-title">Meet the Artisan</h2>
          <div className="artisan-card">
            <img
              src={product.artisan?.profilePictureUrl}
              alt={product.artisan?.name}
              className="artisan-photo"
            />
            <div className="artisan-details">
              <h3>{product.artisan?.name}</h3>
              <p className="artisan-location">
                <i className="fa-solid fa-location-dot"></i>{' '}
                {product.artisan?.location}
              </p>
              <p className="artisan-bio">{product.story}</p>
            </div>
          </div>
        </section>

        {/* In ProductDetail.jsx */}

        {/* --- NEW: Fully Revamped Ratings & Reviews Section --- */}
        <section className="ratings-reviews-section">
          <h2 className="section-title">Ratings & Reviews</h2>
          <div className="ratings-grid">
            {/* --- LEFT COLUMN (SUMMARY) --- */}
            <div className="ratings-summary-panel">
              <div className="overall-rating">
                <div className="rating-value">
                  {product.rating.toFixed(1)}{' '}
                  <span style={{ fontSize: '1.5rem' }}>/ 5</span>
                </div>
                {/* Use the new StarRating component for half-stars */}
                <StarRating rating={product.rating} />
                <div className="total-ratings">
                  {product.ratingCount} Ratings & {reviews.length} Reviews
                </div>
              </div>
              <div className="rating-distribution">
                {calculateRatingDistribution().map((item) => (
                  <div
                    key={item.stars}
                    className={`rating-bar-row ${getRatingClass(item.stars)}`}
                  >
                    <span>
                      {item.stars} <i className="fa-solid fa-star"></i>
                    </span>{' '}
                    {/* Star icon will inherit color */}
                    <div className="rating-bar-container">
                      <div
                        className="rating-bar"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="rating-count-text">({item.count})</span>
                  </div>
                ))}
              </div>
              {/* New section for verified buyers */}
              <div className="verified-buyers-info">
                <i className="fa-solid fa-user-check"></i>
                <div>
                  <strong>{verifiedBuyerCount} Verified Buyers</strong>
                  <p>out of {reviews.length} total reviewers</p>
                </div>
              </div>
            </div>

            {/* --- RIGHT COLUMN (REVIEWS & PHOTOS) --- */}
            <div className="customer-reviews-panel">
              {/* 1. Photos from Customers */}
              {allCustomerPhotos.length > 0 && (
                <div className="customer-photos">
                  <h3>Photos from Customers ({allCustomerPhotos.length})</h3>
                  <div className="customer-photos-grid">
                    {allCustomerPhotos.slice(0, 3).map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt={`review photo ${i + 1}`}
                        onClick={() => handleOpenLightbox(allCustomerPhotos, i)}
                      />
                    ))}
                    {allCustomerPhotos.length > 3 && (
                      <div
                        className="customer-photo-more"
                        onClick={() => handleOpenLightbox(allCustomerPhotos, 3)}
                      >
                        +{allCustomerPhotos.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Scrollable Reviews List */}
              <div className="customer-reviews-list-scrollable">
                {sortedReviews.length > 0 ? (
                  sortedReviews.map((review) => (
                    <div key={review._id} className="customer-review-card">
                      <div className="review-header">
                        <div className="review-user-info">
                          <div className="user-avatar">
                            <div className="avatar-placeholder">
                              {review.userName?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            {/* "Your Review" Label Logic */}
                            {user && user._id === review.user ? (
                              <span className="review-author-name your-review-label">
                                Your Review
                              </span>
                            ) : (
                              <span className="review-author-name">
                                {review.userName}
                              </span>
                            )}
                            {/* Use new StarRating component for individual reviews */}
                            <StarRating rating={review.rating} />
                          </div>
                        </div>
                        <div className="review-meta">
                          {review.isVerified && (
                            <span className="verified-buyer">
                              ✓ Verified Buyer
                            </span>
                          )}
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-text">{review.comment}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="review-images">
                          {/* Show the first 3 images */}
                          {review.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Review ${index + 1}`}
                              className="review-image"
                              onClick={() =>
                                handleOpenLightbox(review.images, index)
                              }
                            />
                          ))}
                          {/* If there are more than 3, show the "+ more" box */}
                          {review.images.length > 3 && (
                            <div
                              className="review-photo-more"
                              onClick={() =>
                                handleOpenLightbox(review.images, 3)
                              }
                            >
                              +{review.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="review-footer">
                        <div className="review-helpful">
                          <span>Helpful?</span>
                          <button
                            className={`helpful-btn ${
                              userVotes[review._id] === 'helpful'
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleMarkHelpful(review._id, 'helpful')
                            }
                          >
                            <i
                              className={`fa-${
                                userVotes[review._id] === 'helpful'
                                  ? 'solid'
                                  : 'regular'
                              } fa-thumbs-up`}
                            ></i>
                            <span>{review.helpful || 0}</span>
                          </button>
                          <button
                            className={`helpful-btn ${
                              userVotes[review._id] === 'notHelpful'
                                ? 'selected'
                                : ''
                            }`}
                            onClick={() =>
                              handleMarkHelpful(review._id, 'notHelpful')
                            }
                          >
                            <i
                              className={`fa-${
                                userVotes[review._id] === 'notHelpful'
                                  ? 'solid'
                                  : 'regular'
                              } fa-thumbs-down`}
                            ></i>
                            <span>{review.notHelpful || 0}</span>
                          </button>
                        </div>
                        {/* Conditional Ellipsis Menu */}
                        {user?._id === review.user && (
                          <div
                            className="review-actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewDropdown(
                                reviewDropdown === review._id
                                  ? null
                                  : review._id,
                              );
                            }}
                          >
                            <button className="action-btn">
                              <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            {reviewDropdown === review._id && (
                              <div className="action-dropdown">
                                <button
                                  onClick={() => handleOpenReviewModal(review)}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteReviewRequest(review._id)
                                  }
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first!</p>
                  </div>
                )}
              </div>
              <div className="write-review-prompt">
                <button
                  className="cta-button"
                  onClick={() => handleOpenReviewModal()}
                >
                  Write a Review
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="similar-products-section">
          <h2 className="section-title">Similar Products</h2>
          <div className="similar-products-carousel">
            {/* --- THIS IS THE BULLETPROOF FIX --- */}
            {Array.isArray(similarProducts) && similarProducts.length > 0 ? (
              <Slider {...slidersettings}>
                {similarProducts.map((product) => (
                  <div key={product._id} className="carousel-slide-padding">
                    <Link
                      to={`/product/${product.slug}`}
                      className="product-card-small"
                    >
                      <div className="product-image-container">
                        <img
                          src={product.variants[0]?.images[0]?.url}
                          alt={product.name}
                        />
                      </div>
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-price">
                          <span className="current-price">
                            Rs. {product.variants[0]?.price.toLocaleString()}
                          </span>
                          {product.variants[0]?.originalPrice >
                            product.variants[0]?.price && (
                            <span className="original-price">
                              Rs.{' '}
                              {product.variants[0]?.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="product-rating-small">
                          <span>{product.rating}</span>
                          <i className="fa-solid fa-star"></i>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            ) : (
              <p style={{ textAlign: 'center', color: '#777' }}>
                No similar products found.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
