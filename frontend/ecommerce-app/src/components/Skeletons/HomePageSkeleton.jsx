import React from 'react';
import './HomePageSkeleton.css'; // Import the CSS

const HomePageSkeleton = () => {
  return (
    <div className="skeleton-wrapper">
      {/* Hero Section Skeleton */}
      <section className="hero-skeleton">
        <div className="hero-skeleton-content">
          <div
            className="skeleton skeleton-title"
            style={{ width: '70%', height: '48px' }}
          ></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </section>

      {/* Welcome Section Skeleton */}
      <section style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div
          className="skeleton skeleton-title"
          style={{ margin: '0 auto 20px' }}
        ></div>
        <div
          className="skeleton skeleton-text"
          style={{ margin: '0 auto 10px' }}
        ></div>
        <div
          className="skeleton skeleton-text"
          style={{ margin: '0 auto 10px', width: '80%' }}
        ></div>
        <div
          className="skeleton skeleton-text short"
          style={{ margin: '0 auto' }}
        ></div>
      </section>

      {/* Promo Cards Skeleton */}
      <section className="promo-grid-skeleton">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="promo-card-skeleton">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div
              className="skeleton skeleton-button"
              style={{ marginTop: 'auto' }}
            ></div>
          </div>
        ))}
      </section>

      {/* Featured Categories Skeleton */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div
          className="skeleton skeleton-title"
          style={{ margin: '0 auto 20px' }}
        ></div>
        <div
          className="skeleton skeleton-text short"
          style={{ margin: '0 auto 40px' }}
        ></div>
        <div className="categories-grid-skeleton">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="category-card-skeleton">
              <div className="skeleton skeleton-image"></div>
              <div className="skeleton-text-group">
                <div
                  className="skeleton skeleton-text"
                  style={{ width: '70%', margin: '0 auto' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Carousel Section Skeleton (showing one slide at a time) */}
      <section className="carousel-skeleton">
        {/* Testimonials Slide Skeleton */}
        <div
          className="skeleton skeleton-title"
          style={{ margin: '0 auto 20px' }}
        ></div>
        <div className="testimonials-grid-skeleton">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="testimonial-card-skeleton">
              <div
                className="skeleton skeleton-text"
                style={{ height: '12px', width: '40%' }}
              ></div>
              <div
                className="skeleton skeleton-text"
                style={{ marginTop: '20px' }}
              ></div>
              <div className="skeleton skeleton-text short"></div>
              <div className="skeleton-user">
                <div className="skeleton skeleton-avatar"></div>
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton skeleton-text"
                    style={{ width: '50%' }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Grid Skeleton */}
      <section className="info-grid-skeleton">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="info-col-skeleton">
            <div
              className="skeleton skeleton-title"
              style={{ height: '24px' }}
            ></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <br />
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePageSkeleton;
