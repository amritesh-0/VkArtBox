import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogData';
import './BlogDetail.css';

export default function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const post = BLOG_POSTS.find(p => p.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);

        const els = sectionRef.current?.querySelectorAll('.reveal');
        if (!els) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    if (!post) {
        return (
            <div className="blog-detail">
                <div className="blog-detail__container">
                    <h1 className="blog-detail__title">Post Not Found</h1>
                    <button className="blog-detail__back" onClick={() => navigate('/blogs')}>
                        ← Back to Journal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-detail" ref={sectionRef}>
            <div className="blog-detail__container">
                <button className="blog-detail__back" onClick={() => navigate('/blogs')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Journal
                </button>

                <div className="blog-detail__layout">
                    {/* Main Content Area */}
                    <main className="blog-detail__main">
                        <header className="blog-detail__post-header reveal">
                            <span className="blog-detail__cat">{post.category}</span>
                            <h1 className="blog-detail__title">{post.title}</h1>
                            <div className="blog-detail__img-wrap">
                                <img src={post.image} alt={post.title} className="blog-detail__img" />
                            </div>
                        </header>

                        <article className="blog-detail__article reveal reveal-delay-2">
                            <div
                                className="blog-detail__content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </article>

                        {/* Comment Section */}
                        <section className="blog-detail__comments reveal reveal-delay-3">
                            <div className="comments__header">
                                <h4 className="comments__title">Reflections</h4>
                                <span className="comments__count">({post.comments?.length || 0})</span>
                            </div>

                            {/* Past Comments List */}
                            {post.comments && post.comments.length > 0 && (
                                <div className="comments__list">
                                    {post.comments.map(comment => (
                                        <div key={comment.id} className="comment__item">
                                            <div className="comment__meta">
                                                <span className="comment__author">{comment.author}</span>
                                                <span className="comment__date">{comment.date}</span>
                                            </div>
                                            <p className="comment__text">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Compact Add Comment Form */}
                            <div className="comments__add">
                                <h5 className="comments__add-title">Add a Thought</h5>
                                <form className="comments__form--compact" onSubmit={e => e.preventDefault()}>
                                    <textarea placeholder="Your reflection..." className="comments__input--small"></textarea>
                                    <div className="comments__form-row--compact">
                                        <input type="text" placeholder="Name" className="comments__input--mini" />
                                        <input type="email" placeholder="Email" className="comments__input--mini" />
                                        <button type="submit" className="btn-gold btn-gold--mini">Post</button>
                                    </div>
                                </form>
                            </div>
                        </section>
                    </main>

                    {/* Sidebar */}
                    <aside className="blog-detail__sidebar">
                        {/* Latest Posts */}
                        <div className="sidebar__widget reveal reveal-delay-1">
                            <h4 className="sidebar__title">Latest Observations</h4>
                            <div className="sidebar__posts">
                                {BLOG_POSTS.slice(0, 3).map(p => (
                                    <div key={p.id} className="sidebar__post-card" onClick={() => navigate(`/blog/${p.id}`)}>
                                        <div className="sidebar__post-img-wrap">
                                            <img src={p.image} alt={p.title} />
                                        </div>
                                        <div className="sidebar__post-info">
                                            <span className="sidebar__post-date">{p.date}</span>
                                            <h5 className="sidebar__post-title">{p.title}</h5>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="sidebar__widget reveal reveal-delay-2">
                            <h4 className="sidebar__title">Categories</h4>
                            <div className="sidebar__pills">
                                {['Portraits', 'Technique', 'Art History', 'Sketches'].map(cat => (
                                    <button key={cat} className="sidebar__pill">{cat}</button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="sidebar__widget reveal reveal-delay-3">
                            <h4 className="sidebar__title">Popular Tags</h4>
                            <div className="sidebar__tags">
                                {['#graphite', '#charcoal', '#artstudy', '#wisdom', '#technique'].map(tag => (
                                    <span key={tag} className="sidebar__tag">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="sidebar__widget reveal reveal-delay-4">
                            <h4 className="sidebar__title">Connect With Us</h4>
                            <div className="sidebar__socials">
                                <button className="sidebar__soc-btn">Ig</button>
                                <button className="sidebar__soc-btn">Tw</button>
                                <button className="sidebar__soc-btn">Fb</button>
                                <button className="sidebar__soc-btn">In</button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
