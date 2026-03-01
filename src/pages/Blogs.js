import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogData';
import './Blogs.css';

export default function Blogs() {
    const sectionRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const els = sectionRef.current?.querySelectorAll('.reveal');
        if (!els) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const featured = BLOG_POSTS.find(p => p.featured);
    const others = BLOG_POSTS.filter(p => !p.featured);

    return (
        <div className="blogs-page" ref={sectionRef}>
            <div className="blogs-container">

                <header className="blogs-modern-header reveal">
                    <div className="header-left">
                        <h1 className="modern-title">
                            Simplicity is the <em>ultimate</em> in sophistication
                        </h1>
                    </div>
                    <div className="header-right">
                        <p className="modern-desc">
                            A contemporary art journal that focuses on history,
                            technique, and the profound stories behind every portrait.
                        </p>
                    </div>
                </header>

                <div className="modern-grid">
                    {/* First row */}
                    {BLOG_POSTS.filter(p => !p.isRelease).map((post, idx) => (
                        <article
                            key={post.id}
                            className={`modern-card reveal reveal-delay-${(idx % 4) + 1} ${post.featured ? 'modern-card--large' : ''}`}
                        >
                            <div className="modern-card-inner">
                                <img src={post.image} alt={post.title} className="modern-img" />
                                <div className="modern-overlay">
                                    <div className="modern-meta">
                                        <span className="modern-cat">{post.category}</span>
                                        <h3 className="modern-post-title">{post.title}</h3>
                                    </div>
                                    <button className="modern-btn" onClick={() => navigate(`/blog/${post.id}`)}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* Recent Release Card */}
                    {BLOG_POSTS.filter(p => p.isRelease).map((post) => (
                        <article
                            key={post.id}
                            className="modern-card modern-card--release reveal reveal-delay-3"
                        >
                            <div className="modern-card-inner">
                                <img src={post.image} alt={post.title} className="modern-img" />
                                <div className="modern-overlay">
                                    <div className="modern-meta">
                                        <span className="modern-cat">{post.category}</span>
                                        <h3 className="modern-post-title">{post.title}</h3>
                                    </div>
                                    <button className="modern-btn modern-btn--gold" onClick={() => navigate(`/blog/${post.id}`)}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    {/* Promo/Static card */}
                    <div className="modern-promo-card reveal reveal-delay-2">
                        <span className="promo-badge">Special Edition</span>
                        <h3 className="promo-text">Explore the art of 19th-century realism.</h3>
                        <button className="promo-btn" onClick={() => navigate('/contact')}>
                            Inquire Now ↗
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
