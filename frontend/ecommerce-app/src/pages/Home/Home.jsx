import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { shopAPI } from '../../services/shopAPI';
import HomePageSkeleton from '../../components/Skeletons/HomePageSkeleton';
import ReCAPTCHA from 'react-google-recaptcha';
import NotificationPopup from '../../components/Popups/NotificationPopup';
import { newsletterAPI } from '../../services/newsletterAPI';
import './Home.css';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    // <div className="carousel-slide"></div>;
    if (i <= rating) {
      stars.push(<i key={i} className="fa-solid fa-star"></i>);
    } else {
      stars.push(<i key={i} className="fa-regular fa-star"></i>);
    }
  }
  return <div className="testimonial-stars">{stars}</div>;
};

const NewsletterSlide = ({ showNotification }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!showNotification) return;

    if (!email) {
      showNotification('Please enter your email address.', 'error');
      return;
    }
    if (!recaptchaToken) {
      showNotification('Please complete the reCAPTCHA.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await newsletterAPI.subscribe({ email, recaptchaToken });
      showNotification(response.message, 'success');
      setEmail(''); // Clear form
      recaptchaRef.current.reset(); // Reset reCAPTCHA
      setRecaptchaToken(null);
    } catch (error) {
      showNotification(
        error.message || 'Subscription failed. Please try again.',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="carousel-slide">
      <div
        className="newsletter-section"
        style={{ background: 'transparent', margin: '0' }}
      >
        <div className="newsletter-container">
          <div className="newsletter-content">
            <div className="newsletter-tag">
              Your Journey into Culture Starts Here!
            </div>
            <h2>
              Join the Tribe – <br />
              Stay Rooted in Culture!
            </h2>
            <p>
              Be the first to hear about timeless crafts, artisan stories, and
              exclusive offers. Sign up to receive updates on handcrafted
              collections, cultural promotions, and special member-only
              discounts.
            </p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <div className="recaptcha-container">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>
          </div>
          <div className="newsletter-image">
            <img src="/assets/images/hats.png" alt="Hand-woven hats" />
          </div>
        </div>
      </div>
    </div>
  );
};
const ServicesSlide = () => {
  const services = [
    {
      icon: 'fa-solid fa-box',
      title: 'Packaging Products',
      description: 'Professional packaging for safe delivery',
      color: 'terracotta',
    },
    {
      icon: 'fa-solid fa-store',
      title: 'Retail / Wholesale Supply',
      description: 'Flexible supply options for all needs',
      color: 'terracotta',
    },
    {
      icon: 'fa-solid fa-truck',
      title: 'Courier Services',
      description: 'Reliable delivery across Nepal',
      color: 'gold',
    },
    {
      icon: 'fa-solid fa-gem',
      title: 'Handmade Jewelry',
      description: 'Unique, artisan-crafted jewelry pieces',
      color: 'terracotta',
    },
  ];

  return (
    <div className="carousel-slide">
      <div
        className="services-section"
        id="services"
        style={{ background: 'transparent', margin: '0' }}
      >
        <div className="services-container">
          <h2 className="services-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card" data-animate>
                <div className={`service-icon ${service.color}`}>
                  <i className={service.icon}></i>
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSlide = ({ latestReviews, loadingReviews, errorReviews }) => (
  <div className="carousel-slide">
    <section className="testimonials-section" id="testimonials">
      <div className="testimonials-container">
        <h2 className="testimonials-title">What Our Customers Say</h2>
        <div className="testimonials-grid">
          {loadingReviews ? (
            <p>Loading reviews...</p>
          ) : errorReviews ? (
            <p>{errorReviews}</p>
          ) : latestReviews.length > 0 ? (
            latestReviews.map((review) => {
              const isVerified =
                review.user?.isEmailVerified && review.user?.isPhoneVerified;
              const avatarInitial = review.userName?.charAt(0).toUpperCase();

              return (
                <article key={review._id} className="testimonial-card">
                  <StarRating rating={review.rating} />
                  <h4 className="review-title">{String(review.title || '')}</h4>
                  <blockquote className="testimonial-text">
                    "{String(review.comment || '')}"
                  </blockquote>
                  <div className="testimonial-user">
                    {review.profilePicture ? (
                      <img
                        src={review.profilePicture}
                        alt={review.userName}
                        className="testimonial-avatar"
                      />
                    ) : (
                      <div className="testimonial-avatar-placeholder">
                        {avatarInitial}
                      </div>
                    )}
                    <div className="testimonial-user-meta">
                      <div className="testimonial-name">{review.userName}</div>
                      {isVerified && (
                        <div className="testimonial-badge">Verified Buyer</div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <p>No reviews available.</p>
          )}
        </div>
      </div>
    </section>
  </div>
);

const CustomCarousel = ({
  children,
  showNotification,
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = React.Children.count(children);
  const autoPlayRef = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (autoPlayInterval) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }
  }, [nextSlide, autoPlayInterval]);

  const handleMouseEnter = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (autoPlayInterval) {
      autoPlayRef.current = setInterval(nextSlide, autoPlayInterval);
    }
  };

  return (
    <div
      className="custom-carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="carousel-container">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="carousel-slide-wrapper">
              {/* --- THIS IS THE FIX --- */}
              {/* The duplicate {child} has been removed. */}
              {React.cloneElement(child, { showNotification })}
            </div>
          ))}
        </div>
      </div>

      <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      <div className="carousel-dots">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const [latestReviews, setLatestReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: '',
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
        const response = await shopAPI.getTopRatedReviews(3);
        setLatestReviews(response || []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setErrorReviews('Failed to load customer reviews.');
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await shopAPI.getFeaturedCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoadingPromotions(true);
        const promotionsData = await shopAPI.getOffersWithImages();
        if (Array.isArray(promotionsData)) {
          const validPromos = promotionsData.filter((p) => p.image);
          setPromotions(validPromos);
        } else {
          setPromotions([]);
        }
      } catch (error) {
        console.error('CRITICAL: Failed to fetch promotions from API:', error);
      } finally {
        setLoadingPromotions(false);
      }
    };
    fetchPageData();
  }, []);

  useEffect(() => {
    if (!loadingCategories && !loadingPromotions && !loadingReviews) {
      setPageLoading(false);
    }
  }, [loadingCategories, loadingPromotions, loadingReviews]);

  useEffect(() => {
    console.log('Initializing Index Page scripts...');

    const handleSmoothScroll = (e) => {
      if (
        e.target.tagName === 'A' &&
        e.target.getAttribute('href')?.startsWith('#')
      ) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleSmoothScroll);

    const animateOnScroll = () => {
      const serviceCards = document.querySelectorAll(
        '.service-card[data-animate]',
      );
      const infoCols = document.querySelectorAll('.info-col[data-animate]');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.1 },
      );

      serviceCards.forEach((card) => observer.observe(card));
      infoCols.forEach((col) => observer.observe(col));
    };

    animateOnScroll();

    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        if (email) {
          alert(`Thank you for subscribing with: ${email}`);
          e.target.reset();
        }
      });
    }

    return () => {
      document.removeEventListener('click', handleSmoothScroll);
    };
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      })
      .catch(() => {
        const tempInput = document.createElement('input');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
      });
  };

  if (pageLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="home-page">
      {notification.show && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() =>
            setNotification({ show: false, message: '', type: '' })
          }
        />
      )}
      <section
        className="hero"
        id="home"
        style={{
          position: 'relative',
          padding: '100px 40px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '520px',
          color: '#333',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url('/assets/images/dress.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: -1,
          }}
        ></div>
        <div className="hero-text">
          <h1>Nepal's Diversity, Delivered to Your Doorstep</h1>
          <p>Newari • Gurung • Limbu • Tamang • Chettri...</p>
          <div className="offer">Free delivery on order above Rs. 2000*</div>
        </div>
      </section>

      <div className="section-down-arrow">
        <a href="#welcome" className="scroll-link">
          <i className="fa-solid fa-angle-down"></i>
        </a>
      </div>

      <section className="welcome-section" id="welcome">
        <div className="welcome-divider"></div>
        <h1>
          Welcome to Timeless Tribe – Your Online Handicrafts Store in Nepal!
        </h1>
        <p className="welcome-desc">
          "<span className="welcome-highlight">Timeless Tribe</span> is your
          one-stop online handicrafts store in Nepal for buying{' '}
          <span className="welcome-em">high-quality, carefully selected</span>,
          and <span className="welcome-em">ethically sourced</span> Nepali
          handicrafts."
        </p>
        <p className="welcome-note">
          We hope you find something that speaks to you and adds a special touch
          to your home or collection.
        </p>
      </section>

      <section className="promo-cards-section">
        <div className="promo-cards-grid">
          {loadingPromotions ? (
            <p>Loading offers...</p>
          ) : (
            promotions.map((promo) => {
              const safeTitle =
                typeof promo.title === 'object'
                  ? ''
                  : String(promo.title || '');
              const safeDescription =
                typeof promo.description === 'object'
                  ? ''
                  : String(promo.description || '');

              return (
                <div
                  key={promo._id}
                  className={`promo-card promo-${promo.theme}`}
                >
                  <div className="promo-card-content">
                    <h3 dangerouslySetInnerHTML={{ __html: safeTitle }}></h3>
                    <div
                      className="promo-sub"
                      dangerouslySetInnerHTML={{ __html: safeDescription }}
                    ></div>

                    <div className="promo-code-wrapper">
                      {promo.couponCode && (
                        <>
                          <span className="promo-code-text">
                            Code: <strong>{promo.couponCode}</strong>
                          </span>
                          <button
                            className={`promo-copy-btn ${
                              copiedCode === promo.couponCode ? 'copied' : ''
                            }`}
                            onClick={() => handleCopyCode(promo.couponCode)}
                            title="Copy Code"
                          >
                            <i className="fa-solid fa-copy"></i>
                            <i className="fa-solid fa-check"></i>
                          </button>
                        </>
                      )}
                    </div>

                    <Link to={String(promo.link || '#')} className="promo-btn">
                      Shop Now
                    </Link>
                  </div>
                  <div className="promo-card-img">
                    <img
                      src={promo.image}
                      alt={
                        typeof promo.title === 'string'
                          ? promo.title.replace(/<[^>]*>/g, ' ')
                          : 'Promotion image'
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
      <section className="featured-categories" id="categories">
        <div className="categories-container">
          <div className="categories-header">
            <h2 className="categories-title">Featured Collections</h2>
            <p className="categories-subtitle">
              Discover authentic Nepalese handicrafts curated with care
            </p>
          </div>
          <div className="categories-grid">
            {loadingCategories ? (
              <div className="categories-loading">
                <div className="loading-spinner"></div>
                <p>Loading collections...</p>
              </div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.slug} className="category-card">
                  <Link
                    to={`/category/${category.slug}`}
                    className="category-link"
                    aria-label={category.name}
                  >
                    <div className="category-image-container">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="category-image"
                        loading="lazy"
                      />
                      <div className="category-overlay">
                        <span className="explore-text">Explore Collection</span>
                      </div>
                    </div>
                    <div className="category-content">
                      <h3 className="category-name">{category.name}</h3>
                      <div className="category-meta">
                        <span className="category-count">
                          {category.itemCount}{' '}
                          {category.itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <div className="category-arrow">
                          <i className="fa-solid fa-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="categories-empty">
                <i className="fa-solid fa-box-open"></i>
                <p>No categories available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="carousel-section-wrapper" id="testimonials">
        <CustomCarousel
          autoPlayInterval={5000}
          showNotification={showNotification}
        >
          <NewsletterSlide />
          <ServicesSlide />
          <TestimonialsSlide
            latestReviews={latestReviews}
            loadingReviews={loadingReviews}
            errorReviews={errorReviews}
          />
        </CustomCarousel>
      </section>

      <section className="info-grid-section">
        <div className="info-grid-container">
          <div className="info-grid">
            <div className="info-col" data-animate>
              <h2 className="info-sub-heading">
                Shop Authentic Nepali Products Online
              </h2>
              <p className="info-body">
                At Timeless Tribe, every product tells a story of Nepal's rich
                culture and timeless craftsmanship. From vibrant fabrics to
                soulful instruments and intricate carvings, our artisans have
                preserved these skills for generations.
              </p>
              <p className="info-body">
                Despite this incredible heritage, only a small part of Nepal's
                treasures reach the world. Our mission is to change that by
                connecting skilled local makers and farmers with global
                customers.
              </p>
              <p className="info-body">
                Each item in our collection—whether traditional dresses,
                handmade crafts, musical instruments, or pooja essentials—is
                carefully chosen for its authenticity, quality, and cultural
                value. When you shop with us, you're not just buying a product,
                you're supporting communities and preserving traditions.
              </p>
              <p className="info-body">
                With worldwide delivery, we bring Nepal's artistry to your
                doorstep. Experience the essence of Nepal—crafted with
                tradition, delivered with love.
              </p>
            </div>
            <div className="info-col" data-animate>
              <h2 className="info-sub-heading">
                Timeless Nepali Dresses & Accessories
              </h2>
              <p className="info-body">
                Discover our extensive collection of traditional Nepali cultural
                wear, including Tamang Dress, Newari Dress, Gurung Dress, Magar
                Dress, Rai Dress, Daura Suruwal, Dhaka Top, and Cholo. Each
                piece showcases vibrant colors and intricate designs that
                reflect the unique heritage of different ethnic communities
                across Nepal.
              </p>
              <h2 className="info-sub-heading">Arts and Crafts</h2>
              <p className="info-body">
                Discover handcrafted woodcrafts, metal crafts, Buddha statues,
                singing bowls, Tibetan items, and Mithila art—timeless creations
                made with care and tradition.
              </p>
              <h3 className="info-sub-heading">Sounds of Nepal</h3>
              <p className="info-body">
                Experience the soul of Nepali music with our selection of
                traditional instruments including the Madal, Sarangi, Jew's
                harp, and Flute. These instruments transport you to the heart of
                Nepali culture and tradition.
              </p>
            </div>
            <div className="info-col" data-animate>
              <h3 className="info-sub-heading">Our Commitment to Quality</h3>
              <p className="info-body">
                Every product in our collection is handpicked for its
                authenticity, exceptional craftsmanship, and cultural
                significance. We work directly with local artisans to ensure you
                receive the finest quality products that truly represent Nepal's
                heritage.
              </p>
              <h3 className="info-sub-heading">Worldwide Delivery</h3>
              <p className="info-body">
                We're proud to offer worldwide delivery, bringing the authentic
                flavors and artistry of Nepal to customers across the globe.
                Experience the magic of Nepali craftsmanship no matter where you
                are.
              </p>
              <div className="info-callout" data-animate>
                <h3 className="callout-heading">Celebrate Nepal's Heritage</h3>
                <p className="callout-body">
                  Join us in celebrating Nepal's rich heritage. Shop with
                  Timeless Tribe, support local artisans, and promote
                  sustainable economic growth. Make a difference, one purchase
                  at a time.
                </p>
                <a href="#" className="callout-link">
                  Explore Our Collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
