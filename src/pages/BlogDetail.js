import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
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
    const [commentForm, setCommentForm] = useState({
        text: '',
        author: '',
        email: '',
    });
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentMessage, setCommentMessage] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const postRef = doc(db, 'blogs', id);
        const unsubscribe = onSnapshot(
            postRef,
            (postSnapshot) => {
                if (postSnapshot.exists()) {
                    setPost({ id: postSnapshot.id, ...postSnapshot.data() });
                } else {
                    setPost(null);
                }
            },
            (error) => {
                console.error('Error subscribing to blog detail:', error);
                setPost(null);
            }
        );

        const fetchSidebarData = async () => {
            try {
                const latestQuery = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
                const latestSnapshot = await getDocs(latestQuery);
                const latestPosts = latestSnapshot.docs.map((blogDoc) => ({ id: blogDoc.id, ...blogDoc.data() }));

                setAllPosts(latestPosts);
            } catch (error) {
                console.error('Error fetching blog detail:', error);
                setAllPosts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSidebarData();

        return () => unsubscribe();
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
    const comments = post?.comments || [];

    const handleCommentChange = (event) => {
        const { name, value } = event.target;
        setCommentForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        if (!post) return;

        const trimmedText = commentForm.text.trim();
        const trimmedAuthor = commentForm.author.trim();
        const trimmedEmail = commentForm.email.trim();

        if (!trimmedText || !trimmedAuthor || !trimmedEmail) {
            setCommentMessage('Please fill in your reflection, name, and email.');
            return;
        }

        setCommentSubmitting(true);
        setCommentMessage('');

        const nextComment = {
            id: Date.now(),
            author: trimmedAuthor,
            email: trimmedEmail,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            text: trimmedText,
        };

        try {
            await updateDoc(doc(db, 'blogs', id), {
                comments: [...comments, nextComment],
            });
            setCommentForm({ text: '', author: '', email: '' });
            setCommentMessage('Your reflection has been added.');
        } catch (error) {
            console.error('Error saving comment:', error);
            setCommentMessage('Failed to post your reflection. Please try again.');
        } finally {
            setCommentSubmitting(false);
        }
    };

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
                                <span className="comments__count">({comments.length})</span>
                            </div>

                            {/* Past Comments List */}
                            {comments.length > 0 && (
                                <div className="comments__list">
                                    {comments.map((comment) => (
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
                                <form className="comments__form--compact" onSubmit={handleCommentSubmit}>
                                    <textarea
                                        name="text"
                                        placeholder="Your reflection..."
                                        className="comments__input--small"
                                        value={commentForm.text}
                                        onChange={handleCommentChange}
                                    ></textarea>
                                    <div className="comments__form-row--compact">
                                        <input
                                            type="text"
                                            name="author"
                                            placeholder="Name"
                                            className="comments__input--mini"
                                            value={commentForm.author}
                                            onChange={handleCommentChange}
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="comments__input--mini"
                                            value={commentForm.email}
                                            onChange={handleCommentChange}
                                        />
                                        <button type="submit" className="btn-gold btn-gold--mini" disabled={commentSubmitting}>
                                            {commentSubmitting ? 'Posting...' : 'Post'}
                                        </button>
                                    </div>
                                    {commentMessage && <div className="comments__message">{commentMessage}</div>}
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
