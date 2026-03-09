import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { BLOG_POSTS } from '../data/blogData';
import './Blogs.css';

const FEATURED_CATEGORIES = ['Art History', 'Technique', 'Portraits'];

export default function Blogs() {
    const sectionRef = useRef(null);
    const navigate = useNavigate();
    const [posts, setPosts] = useState(BLOG_POSTS);
    const [modalCategory, setModalCategory] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(blogsQuery);
                const dbPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                if (dbPosts.length > 0) {
                    setPosts(dbPosts);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                setPosts(BLOG_POSTS);
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

    const categoryCards = FEATURED_CATEGORIES.map((category) => {
        const related = posts.filter((post) => post.category === category);
        const fallback = BLOG_POSTS.find((post) => post.category === category);
        const previewPost = related[0] || fallback || BLOG_POSTS[0];

        return {
            category,
            image: previewPost?.image,
            title: category,
        };
    });

    const modalPosts = modalCategory ? posts.filter((post) => post.category === modalCategory) : [];

    return (
        <div className="blogs-page" ref={sectionRef}>
            <div className="blogs-container">
                <header className="blogs-modern-header">
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
                    {categoryCards.map((card, idx) => (
                        <article
                            key={card.category}
                            className={`modern-card ${modalCategory === card.category ? 'modern-card--active' : ''}`}
                            onClick={() => setModalCategory(card.category)}
                        >
                            <div className="modern-card-inner">
                                <img src={card.image} alt={card.title} className="modern-img" />
                                <div className="modern-overlay">
                                    <div className="modern-meta">
                                        <span className="modern-cat">{card.category}</span>
                                        <h3 className="modern-post-title">{card.title}</h3>
                                    </div>
                                    <button type="button" className="modern-btn" onClick={(e) => { e.stopPropagation(); setModalCategory(card.category); }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}

                    <div className="modern-promo-card">
                        <span className="promo-badge">Special Edition</span>
                        <h3 className="promo-text">Explore the art of 19th-century realism.</h3>
                        <button type="button" className="promo-btn" onClick={() => navigate('/contact')}>
                            Inquire Now ↗
                        </button>
                    </div>
                </div>
            </div>

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
                                        <img src={post.image} alt={post.title} className="category-modal-card-img" />
                                        <div className="category-modal-card-body">
                                            <span>{post.category}</span>
                                            <h3>{post.title}</h3>
                                            <p>{post.excerpt || 'Read full article'}</p>
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
