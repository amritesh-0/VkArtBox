import React, { useState, useRef, useEffect } from 'react';
import './CollectionCarousel.css';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/* ── ICONS & PREVIEW GRIDS ── */
const icons = {
  portraits: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  wildlife: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M6 34 C12 24, 18 20, 24 20 C32 20, 38 26, 42 34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="34" cy="14" rx="6" ry="5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="32" cy="13" r="1.5" fill="currentColor" />
      <path d="M12 16 C10 11 13 8 16 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 20 C5 15 8 11 11 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  prints: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="28" x2="25" y2="28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="36" cy="36" r="7" fill="rgba(76,232,200,0.15)" stroke="currentColor" strokeWidth="1.2" />
      <path d="M33 36l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  default: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="9" y="9" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M17 29l6-8 4 5 4-5 6 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="18" r="2.5" fill="currentColor" />
    </svg>
  ),
};

/* ── PREVIEW GRIDS ── */
function PortraitsPreview({ previews, accent }) {
  if (!previews || previews.length === 0) {
    return <div className="cc-preview-empty">No previews available yet.</div>;
  }

  return (
    <div className="cc-preview cc-preview--portraits">
      <div className="cc-prev-tall">
        <img src={previews[0].img} alt={previews[0].name} loading="lazy" />
        <div className="cc-prev-name">{previews[0].name}</div>
      </div>
      <div className="cc-prev-right">
        {previews.slice(1, 3).map((p) => (
          <div key={p.name} className="cc-prev-item">
            <img src={p.img} alt={p.name} loading="lazy" />
            <div className="cc-prev-name">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WildlifePreview({ previews, accent }) {
  if (!previews || previews.length === 0) {
    return <div className="cc-preview-empty">No previews available yet.</div>;
  }

  return (
    <div className="cc-preview cc-preview--wildlife">
      <div className="cc-prev-hero">
        <img src={previews[0].img} alt={previews[0].name} loading="lazy" />
        <div className="cc-prev-name">{previews[0].name}</div>
      </div>
      <div className="cc-prev-stack">
        {previews.slice(1, 3).map((p) => (
          <div key={p.name} className="cc-prev-item">
            <img src={p.img} alt={p.name} loading="lazy" />
            <div className="cc-prev-name">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintsPreview({ printFeature, printSpecs, accent, accentRgb }) {
  if (!printFeature?.img) {
    return <div className="cc-preview-empty">No previews available yet.</div>;
  }

  return (
    <div className="cc-preview cc-preview--prints">
      <div className="cc-prev-print-img">
        <img src={printFeature.img} alt={printFeature.name} loading="lazy" />
        <div className="cc-prev-name" style={{ '--acc': accent }}>{printFeature.name}</div>
      </div>
      <div className="cc-prev-specs">
        <div className="cc-specs-title">Museum Quality</div>
        <div className="cc-specs-list">
          {printSpecs.map(s => (
            <div key={s} className="cc-spec-item">
              <span className="cc-spec-dot" style={{ background: accent, boxShadow: `0 0 6px rgba(${accentRgb},0.6)` }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── SINGLE CARD ── */
function CollectionCard({ col }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/collection/${col.id}`);
  };

  const accentStyle = { '--col-accent': col.accent, '--col-accent-rgb': col.accentRgb };

  return (
    <div
      className={`cc-card cc-card--${col.id} ${hovered ? 'cc-card--hovered' : ''}`}
      style={accentStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(v => !v)}
    >
      {/* Layers */}
      <div className="cc-card__bg" style={{ backgroundImage: `url(${col.bgImage})` }} />
      <div className="cc-card__grad" />

      {/* Resting face */}
      <div className="cc-card__face" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="cc-card__number">{col.number}</div>
        <div className="cc-card__icon" style={{ color: col.accent }}>
          {icons[col.id] || icons.default}
        </div>
        <h3 className="cc-card__title">{col.title}</h3>
        <p className="cc-card__desc">{col.desc}</p>
        <div className="cc-card__count">{col.count}</div>
        <div className="cc-card__cta" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          Explore <span>→</span>
        </div>
      </div>

      {/* Hover panel */}
      <div className="cc-card__hover" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <div className="cc-card__hover-label">
          {col.hoverLabel}
        </div>

        <div className="cc-card__hover-content">
          {col.previewType === 'portraits' && (
            <PortraitsPreview previews={col.previews} accent={col.accent} accentRgb={col.accentRgb} />
          )}
          {col.previewType === 'wildlife' && (
            <WildlifePreview previews={col.previews} accent={col.accent} accentRgb={col.accentRgb} />
          )}
          {col.previewType === 'prints' && (
            <PrintsPreview
              printFeature={col.printFeature}
              printSpecs={col.printSpecs}
              accent={col.accent}
              accentRgb={col.accentRgb}
            />
          )}
        </div>

        <button className="cc-card__btn" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
          {col.btnLabel}
        </button>
      </div>
    </div>
  );
}

/* ── MAIN SECTION ── */
export default function CollectionCarousel() {
  const ref = useRef(null);
  const [collectionList, setCollectionList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [collectionsSnapshot, artworksSnapshot] = await Promise.all([
          getDocs(collection(db, 'collections')),
          getDocs(collection(db, 'artworks')),
        ]);

        const artworkCountByCollection = artworksSnapshot.docs.reduce((acc, artDoc) => {
          const collectionId = artDoc.data().collectionId;
          if (!collectionId) return acc;
          acc[collectionId] = (acc[collectionId] || 0) + 1;
          return acc;
        }, {});

        const dbCollections = collectionsSnapshot.docs.map((collectionDoc) => {
          const data = collectionDoc.data();
          const artworkCount = artworkCountByCollection[collectionDoc.id] || 0;
          return {
            id: collectionDoc.id,
            ...data,
            count: `${artworkCount} Artworks`,
          };
        });

        setCollectionList(dbCollections.filter((collectionItem) => collectionItem.id !== 'prints'));
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollectionList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="cc-section" id="collections" ref={ref}>
      <div className="cc-section__inner">
        <div className="section-header reveal">
          <div className="section-eyebrow">Explore</div>
          <h2 className="section-title">Browse by <em>Collection</em></h2>
          <p className="cc-sub reveal reveal-delay-1">Hover to discover the art within each world</p>
        </div>

        {loading ? (
          <div className="cc-status">Loading collections...</div>
        ) : collectionList.length === 0 ? (
          <div className="cc-status">No collections available right now.</div>
        ) : (
          <div className="cc-track">
            {collectionList.map(col => (
              <CollectionCard key={col.id} col={col} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
