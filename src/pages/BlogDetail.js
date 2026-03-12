import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { SOCIAL_LINKS, SocialIcon } from '../components/SocialLinks';
import './BlogDetail.css';

export default function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const sectionRef = useRef(null);
    const [post, setPost] = useState(null);
    const [allPosts, setAllPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchPostData = async () => {
            try {
                const postDoc = await getDoc(doc(db, 'blogs', id));
                const latestQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
                const latestSnapshot = await getDocs(latestQuery);
                const latestPosts = latestSnapshot.docs.map((blogDoc) => ({ id: blogDoc.id, ...blogDoc.data() }));

                setAllPosts(latestPosts);

                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() });
                } else {
                    setPost(null);
                }
            } catch (error) {
                console.error('Error fetching blog detail:', error);
                setPost(null);
                setAllPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [id]);

    useEffect(() => {
        const els = sectionRef.current?.querySelectorAll('.reveal');
        if (!els) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [post?.id, allPosts.length]);

    const categories = [...new Set(allPosts.map((p) => p.category).filter(Boolean))].slice(0, 4);
    const tags = [...new Set(allPosts.flatMap((p) => p.tags || []).filter(Boolean))].slice(0, 5);
    const latestPosts = allPosts.filter((p) => p.id !== id).slice(0, 3);

    if (loading) {
        return (
            <div className="blog-detail">
                <div className="blog-detail__container">
                    <h1 className="blog-detail__title">Loading article...</h1>
                </div>
            </div>
        );
    }

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
                            {post.subtitle && <h2 className="blog-detail__subtitle">{post.subtitle}</h2>}
                            <div className="blog-detail__meta-info">
                                {post.author && <span className="blog-detail__author">By {post.author}</span>}
                                {post.publication && (
                                    <>
                                        <span className="blog-detail__separator">•</span>
                                        <span className="blog-detail__publication">{post.publication}</span>
                                    </>
                                )}
                                <span className="blog-detail__separator">•</span>
                                <span className="blog-detail__date">{post.date}</span>
                            </div>
                            <div className="blog-detail__img-wrap">
                                <img src={post.image} alt={post.title} className="blog-detail__img" />
                            </div>
                        </header>

                        <article className="blog-detail__article reveal reveal-delay-2">
                            {post.lead && (
                                <section className="blog-detail__section blog-detail__section--lead">
                                    <p className="blog-detail__lead-text">{post.lead}</p>
                                </section>
                            )}

                            {post.background && (
                                <section className="blog-detail__section">
                                    <h3 className="blog-detail__section-title">Background & Context</h3>
                                    <p>{post.background}</p>
                                </section>
                            )}

                            {post.analysis && (
                                <section className="blog-detail__section">
                                    <h3 className="blog-detail__section-title">Main Analysis</h3>
                                    <p>{post.analysis}</p>
                                </section>
                            )}

                            {post.artworkDescription && (
                                <section className="blog-detail__section">
                                    <h3 className="blog-detail__section-title">Artwork Description</h3>
                                    <p>{post.artworkDescription}</p>
                                </section>
                            )}

                            {post.quotes && post.quotes.length > 0 && (
                                <section className="blog-detail__section blog-detail__section--quotes">
                                    {post.quotes.map((quote, index) => (
                                        <blockquote key={index} className="blog-detail__quote">
                                            "{quote}"
                                        </blockquote>
                                    ))}
                                </section>
                            )}

                            {post.conclusion && (
                                <section className="blog-detail__section">
                                    <h3 className="blog-detail__section-title">Conclusion</h3>
                                    <p>{post.conclusion}</p>
                                </section>
                            )}

                            {post.content && (
                                <div
                                    className="blog-detail__content"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            )}
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
                                {latestPosts.map(p => (
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
                                {categories.map(cat => (
                                    <button key={cat} className="sidebar__pill">{cat}</button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Tags */}
                        <div className="sidebar__widget reveal reveal-delay-3">
                            <h4 className="sidebar__title">Popular Tags</h4>
                            <div className="sidebar__tags">
                                {tags.map(tag => (
                                    <span key={tag} className="sidebar__tag">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="sidebar__widget reveal reveal-delay-4">
                            <h4 className="sidebar__title">Connect With Us</h4>
                            <div className="sidebar__socials">
                                {SOCIAL_LINKS.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="sidebar__soc-btn"
                                        aria-label={social.label}
                                        title={social.label}
                                    >
                                        <SocialIcon type={social.key} className="sidebar__soc-icon" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
