import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collections } from '../data/collectionData';
import './CollectionDetail.css';

export default function CollectionDetail() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const found = collections.find(c => c.id === id);
        setCollection(found);
    }, [id]);

    useEffect(() => {
        document.body.style.overflow = selectedArtwork ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedArtwork]);

    if (!collection) {
        return (
            <div className="cd-not-found">
                <h2>Collection Not Found</h2>
                <Link to="/" className="cd-back-link">Return Home</Link>
            </div>
        );
    }

    const openModal = (artwork) => {
        setSelectedArtwork(artwork);
    };

    const closeModal = () => {
        setSelectedArtwork(null);
    };

    return (
        <div className="cd-page">
            {/* Hero Section */}
            <section className="cd-hero" style={{ '--accent': collection.accent }}>
                <div className="cd-hero-bg" style={{ backgroundImage: `url(${collection.heroImage})` }}>
                    <div className="cd-hero-overlay"></div>
                </div>
                <div className="cd-hero-content">
                    <div className="cd-hero-number">{collection.number}</div>
                    <h1 className="cd-hero-title">{collection.title} Collection</h1>
                    <p className="cd-hero-desc">{collection.desc}</p>
                </div>
            </section>

            {/* About & Stats */}
            <section className="cd-about-section">
                <div className="cd-about-grid">
                    <div className="cd-about-text">
                        <h2>About the Collection</h2>
                        <p>{collection.about}</p>
                    </div>
                    <div className="cd-about-stats">
                        <div className="cd-stat">
                            <span className="cd-stat-val">{collection.count}</span>
                            <span className="cd-stat-label">Total Pieces</span>
                        </div>
                        <div className="cd-stat">
                            <span className="cd-stat-val" style={{ color: collection.accent }}>100%</span>
                            <span className="cd-stat-label">Handcrafted</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artworks Grid */}
            <section className="cd-gallery">
                <div className="cd-gallery-header">
                    <h2>Featured Artworks</h2>
                    <div className="cd-divider" style={{ backgroundColor: collection.accent }}></div>
                </div>

                <div className="cd-masonry">
                    {collection.artworks && collection.artworks.map((art, index) => (
                        <div
                            key={art.id}
                            className="cd-art-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => openModal(art)}
                        >
                            <div className="cd-art-img-wrap">
                                <img src={art.image} alt={art.title} className="cd-art-img" loading="lazy" />
                                <div className="cd-art-hover">
                                    <span className="cd-view-text">View Details</span>
                                </div>
                            </div>
                            <div className="cd-art-info">
                                <h3>{art.title}</h3>
                                <p>{art.medium}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Image Detail Modal */}
            {selectedArtwork && (
                <div className="cd-modal" onClick={closeModal}>
                    <div className="cd-modal-close" onClick={closeModal}>&times;</div>
                    <div className="cd-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="cd-modal-image-col">
                            <img src={selectedArtwork.image} alt={selectedArtwork.title} />
                        </div>
                        <div className="cd-modal-info-col" style={{ '--accent': collection.accent }}>
                            <h2>{selectedArtwork.title}</h2>
                            <div className="cd-modal-meta">
                                <div className="cd-meta-item">
                                    <span className="cd-meta-label">Medium</span>
                                    <span className="cd-meta-val">{selectedArtwork.medium}</span>
                                </div>
                                <div className="cd-meta-item">
                                    <span className="cd-meta-label">Dimensions</span>
                                    <span className="cd-meta-val">{selectedArtwork.dimensions}</span>
                                </div>
                                <div className="cd-meta-item">
                                    <span className="cd-meta-label">Year</span>
                                    <span className="cd-meta-val">{selectedArtwork.year}</span>
                                </div>
                            </div>

                            <div className="cd-modal-desc">
                                <h3>Artwork Details</h3>
                                <p>{selectedArtwork.description}</p>
                            </div>

                            <div className="cd-modal-purchase">
                                <div className="cd-status">
                                    <span className={`cd-status-indicator ${selectedArtwork.status === 'Sold' ? 'sold' : 'available'}`}></span>
                                    {selectedArtwork.status}
                                </div>
                                {selectedArtwork.price && (
                                    <div className="cd-price">{selectedArtwork.price}</div>
                                )}
                                {selectedArtwork.status !== 'Sold' && (
                                    <button className="cd-inquire-btn" style={{ backgroundColor: collection.accent }}>
                                        Inquire About Piece
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
