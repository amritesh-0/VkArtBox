import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import './Blogs.css';

const FEATURED_CATEGORIES = ['Art History', 'Art Tools', 'Stories of Artwork', 'Stories of Artist'];

export default function Blogs() {
    const sectionRef = useRef(null);
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalCategory, setModalCategory] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(blogsQuery);
                const dbPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setPosts(dbPosts);
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    useEffect(() => {
        document.body.style.overflow = modalCategory ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [modalCategory]);

    const categoryCards = FEATURED_CATEGORIES.map((category, index) => {
        const related = posts.filter((post) => post.category === category);
        const previewPost = related[0] || null;

        // Assign different sizes for a dynamic grid layout
        const sizes = ['large', 'medium', 'medium', 'small'];
        const size = sizes[index % sizes.length];

        return {
            category,
            image: previewPost?.image,
            title: category,
            size: size,
            count: related.length
        };
    });

    const discoveryCards = categoryCards.slice(1);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [posts, discoveryCards.length]); // Re-run when posts or discovery grid changes

    useEffect(() => {
        if (!modalCategory) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setModalCategory(null);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [modalCategory]);

    const modalPosts = modalCategory ? posts.filter((post) => post.category === modalCategory) : [];

    return (
        <div className="blogs-editorial" ref={sectionRef}>
            <div className="editorial-container">
                {/* 1. HERO SECTION: The Manifesto */}
                <header className="editorial-hero reveal">
                    <div className="hero-content">
                        <span className="hero-eyebrow">The Art Journal</span>
                        <h1 className="hero-title">
                            Observation is the <em>Soul</em> of Art
                        </h1>
                        <p className="hero-manifesto">
                            In a world of fleeting glimpses, we choose to linger. This journal is a sanctuary for the discerning eye—a curation of heritage, technique, and the silent narratives that breathe life into every stroke. We do not just look; we observe, we reflect, and we celebrate the profound simplicity of the human spirit.
                        </p>
                        <p className="hero-description">
                            Our collections are organized into four distinct narratives, each exploring a unique facet of the artistic journey. From the historical lineages of mastery to the practical tools of the trade, explore the curated chapters of our art journal below.
                        </p>
                    </div>
                </header>

                {/* 2. CATEGORY GALLERY: All Categories Together */}
                <section className="editorial-gallery">
                    <div className="gallery-header reveal">
                        <h2 className="gallery-title">Narrative Chapters</h2>
                        <div className="gallery-line"></div>
                    </div>
                    
                    {loading ? (
                        <div className="editorial-status">Loading chapters...</div>
                    ) : (
                        <div className="gallery-grid">
                            {categoryCards.map((card, idx) => (
                                <article
                                    key={card.category}
                                    className={`gallery-card gallery-card--${card.size} reveal reveal-delay-${idx + 1}`}
                                    onClick={() => setModalCategory(card.category)}
                                >
                                    <div className="gallery-card-inner">
                                        {card.image ? (
                                            <img src={card.image} alt={card.title} className="gallery-img" />
                                        ) : (
                                            <div className="gallery-img gallery-img--empty" aria-hidden="true"></div>
                                        )}
                                        <div className="gallery-overlay">
                                            <div className="gallery-topline">
                                                <span className="gallery-cat">{card.category}</span>
                                                <span className="gallery-count">{card.count} posts</span>
                                            </div>
                                            <div className="gallery-copy">
                                                <h3 className="gallery-post-title">{card.title}</h3>
                                                <p className="gallery-post-desc">
                                                    {card.category === 'Art History' && "Tracing the lineage of classical masters and timeless techniques."}
                                                    {card.category === 'Art Tools' && "An exploration of the physical instruments that bridge mind and canvas."}
                                                    {card.category === 'Stories of Artwork' && "The hidden inspirations and technical journey behind our key pieces."}
                                                    {card.category === 'Stories of Artist' && "Personal reflections on the creative spirit and the path of the observer."}
                                                </p>
                                            </div>
                                            <div className="gallery-footer">
                                                <span className="gallery-link-label">Explore chapter</span>
                                            </div>
                                            <button type="button" className="gallery-btn">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* 3. NARRATIVE BREAK & PROMO */}
                <section className="editorial-footer reveal">
                    <div className="footer-content">
                        <div className="footer-narrative">
                            <blockquote className="footer-quote">
                                "The art of seeing is the foundation of the art of creating."
                            </blockquote>
                            <p className="footer-paragraph">
                                Every line we draw is an act of discovery. We invite you to join us in this ongoing exploration of light, shadow, and the stories written in between.
                            </p>
                        </div>
                        <div className="editorial-promo-card">
                            <span className="promo-badge">Need More</span>
                            <h3 className="promo-text">Want More Category?</h3>
                            <button type="button" className="promo-btn" onClick={() => navigate('/contact')}>
                                Enquire Now ↗
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* MODAL (UNCHANGED LOGIC) */}
            {modalCategory && (
                <div className="category-modal-backdrop" onClick={() => setModalCategory(null)}>
                    <div className="category-modal" role="dialog" aria-modal="true" aria-label={`${modalCategory} blogs`} onClick={(e) => e.stopPropagation()}>
                        <div className="category-modal-header">
                            <div>
                                <span className="category-modal-eyebrow">Category</span>
                                <h2>{modalCategory}</h2>
                                <p>{modalPosts.length} related posts</p>
                            </div>
                            <button type="button" className="category-modal-close" onClick={() => setModalCategory(null)} aria-label="Close">
                                ×
                            </button>
                        </div>

                        {modalPosts.length === 0 ? (
                            <div className="category-modal-empty">No blogs available in this category yet.</div>
                        ) : (
                            <div className="category-modal-grid">
                                {modalPosts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="category-modal-card"
                                        onClick={() => {
                                            setModalCategory(null);
                                            navigate(`/blog/${post.id}`);
                                        }}
                                    >
                                        <div className="category-modal-card-media">
                                            <img src={post.image} alt={post.title} className="category-modal-card-img" />
                                        </div>
                                        <div className="category-modal-card-body">
                                            <span>{post.category}</span>
                                            <h3>{post.title}</h3>
                                            <p>{post.excerpt || 'Read full article'}</p>
                                            <div className="category-modal-card-footer">
                                                <span className="category-modal-card-link">Read article</span>
                                                <span className="category-modal-card-arrow" aria-hidden="true">↗</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
