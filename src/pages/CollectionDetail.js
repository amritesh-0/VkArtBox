import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection as firestoreCollection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { collections } from '../data/collectionData';
import './CollectionDetail.css';

export default function CollectionDetail() {
    const { id } = useParams();
    const [collectionData, setCollectionData] = useState(null);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchCollection = async () => {
            try {
                const collectionDoc = await getDoc(doc(db, 'collections', id));
                const artworksQuery = query(firestoreCollection(db, 'artworks'), where('collectionId', '==', id));
                const artworksSnapshot = await getDocs(artworksQuery);
                const artworks = artworksSnapshot.docs.map((artDoc) => ({ id: artDoc.id, ...artDoc.data() }));

                if (collectionDoc.exists()) {
                    const data = collectionDoc.data();
                    setCollectionData({
                        id: collectionDoc.id,
                        ...data,
                        count: `${artworks.length} Artworks`,
                        artworks,
                    });
                    return;
                }
            } catch (error) {
                console.error('Error fetching collection detail:', error);
            }

            const found = collections.find((c) => c.id === id);
            setCollectionData(found || null);
        };

        fetchCollection();
    }, [id]);

    useEffect(() => {
        document.body.style.overflow = selectedArtwork ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedArtwork]);

    if (!collectionData) {
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
            <section className="cd-hero" style={{ '--accent': collectionData.accent }}>
                <div className="cd-hero-bg" style={{ backgroundImage: `url(${collectionData.heroImage})` }}>
                    <div className="cd-hero-overlay"></div>
                </div>
                <div className="cd-hero-content">
                    <div className="cd-hero-number">{collectionData.number}</div>
                    <h1 className="cd-hero-title">{collectionData.title} Collection</h1>
                    <p className="cd-hero-desc">{collectionData.desc}</p>
                </div>
            </section>

            {/* About & Stats */}
            <section className="cd-about-section">
                <div className="cd-about-grid">
                    <div className="cd-about-text">
                        <h2>About the Collection</h2>
                        <p>{collectionData.about}</p>
                    </div>
                    <div className="cd-about-stats">
                        <div className="cd-stat">
                            <span className="cd-stat-val">{collectionData.count}</span>
                            <span className="cd-stat-label">Total Pieces</span>
                        </div>
                        <div className="cd-stat">
                            <span className="cd-stat-val" style={{ color: collectionData.accent }}>100%</span>
                            <span className="cd-stat-label">Handcrafted</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Artworks Grid */}
            <section className="cd-gallery">
                <div className="cd-gallery-header">
                    <h2>Featured Artworks</h2>
                    <div className="cd-divider" style={{ backgroundColor: collectionData.accent }}></div>
                </div>

                <div className="cd-masonry">
                    {collectionData.artworks && collectionData.artworks.map((art, index) => (
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
                        <div className="cd-modal-info-col" style={{ '--accent': collectionData.accent }}>
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
                                    <button className="cd-inquire-btn" style={{ backgroundColor: collectionData.accent }}>
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
