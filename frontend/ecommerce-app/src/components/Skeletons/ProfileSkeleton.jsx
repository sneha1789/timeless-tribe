import React from 'react';
import './Skeletons.css';

const ProfileSkeleton = () => {
    return (
        <div className="profile-page">
            <main className="profile-page-container skeleton">
                <div className="profile-grid">
                    <aside className="profile-sidebar-skeleton">
                        <div className="pfp-skeleton skeleton-block" />
                        <div className="skeleton-line medium" />
                        <div className="skeleton-line short" />
                        <div className="nav-skeleton">
                            <div className="skeleton-line long" />
                            <div className="skeleton-line long" />
                            <div className="skeleton-line long" />
                        </div>
                    </aside>
                    <section className="profile-content-skeleton">
                        <div className="skeleton-line h2" />
                        <div className="form-row-skeleton">
                            <div className="skeleton-block long" />
                            <div className="skeleton-block long" />
                        </div>
                        <div className="form-row-skeleton">
                            <div className="skeleton-block long" />
                            <div className="skeleton-block long" />
                        </div>
                        <div className="button-skeleton skeleton-block" style={{ width: '150px' }} />
                    </section>
                </div>
            </main>
        </div>
    );
};

export default ProfileSkeleton;