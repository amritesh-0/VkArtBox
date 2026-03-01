import React, { useState, useRef, useEffect } from 'react';
import './CollectionCarousel.css';

/* ── DATA ── */
const collections = [
  {
    id: 'portraits',
    number: '01',
    accent: '#9B7DE8',
    accentRgb: '155,125,232',
    bgImage: 'https://www.vkartbox.com/assets/img/backgrounds/Keerthy.jpg',
    gradientColor: 'rgba(80,50,160,0.7)',
    title: 'Portraits',
    desc: 'Celebrities, icons & timeless faces rendered in graphite precision',
    count: '7 Artworks',
    hoverLabel: 'Portraits Collection',
    btnLabel: 'View All Portraits',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    previewType: 'portraits',
    previews: [
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Keerthy.jpg', name: 'Keerthy Suresh' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Rashmika.JPG', name: 'Rashmika' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Tapsee.jpg', name: 'Tapsee Pannu' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Kiara.jpg', name: 'Kiara Advani' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Sushant.jpg', name: 'Sushant Singh' },
    ],
  },
  {
    id: 'wildlife',
    number: '02',
    accent: '#E8A44C',
    accentRgb: '232,164,76',
    bgImage: 'https://www.vkartbox.com/assets/img/backgrounds/Bengal-Tiger.jpg',
    gradientColor: 'rgba(120,60,20,0.6)',
    title: 'Wildlife',
    desc: 'Majestic beasts of nature captured in charcoal, graphite & colour pencil',
    count: '3 Artworks',
    hoverLabel: 'Wildlife Collection',
    btnLabel: 'View All Wildlife',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M6 34 C12 24, 18 20, 24 20 C32 20, 38 26, 42 34" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="34" cy="14" rx="6" ry="5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="32" cy="13" r="1.5" fill="currentColor" />
        <path d="M12 16 C10 11 13 8 16 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M8 20 C5 15 8 11 11 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    previewType: 'wildlife',
    previews: [
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/Bengal-Tiger.jpg', name: 'Bengal Tiger', badge: 'Colour Pencil' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/lions.jpg', name: 'Mufasa', badge: 'Graphite' },
      { img: 'https://www.vkartbox.com/assets/img/backgrounds/white-tiger.jpg', name: 'Snow White', badge: 'Sold', sold: true },
    ],
  },
  {
    id: 'prints',
    number: '03',
    accent: '#4CE8C8',
    accentRgb: '76,232,200',
    bgImage: 'https://www.vkartbox.com/assets/img/Saraswati.jpeg',
    gradientColor: 'rgba(30,80,80,0.6)',
    title: 'Prints',
    desc: 'Museum-quality fine art prints — bring the studio home, beautifully reproduced',
    count: 'Coming Soon',
    hoverLabel: 'Prints Collection',
    btnLabel: 'Notify Me',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="6" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="16" y1="28" x2="25" y2="28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="36" cy="36" r="7" fill="rgba(76,232,200,0.15)" stroke="currentColor" strokeWidth="1.2" />
        <path d="M33 36l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    previewType: 'prints',
    printFeature: { img: 'https://www.vkartbox.com/assets/img/Saraswati.jpeg', name: 'Saraswati — Fine Art Print' },
    printSpecs: [
      'Giclée archival printing',
      'Cotton rag 300gsm paper',
      'Hand-signed by artist',
      'Limited editions only',
      'Shipped from Indore, India',
    ],
  },
];

/* ── PREVIEW GRIDS ── */
function PortraitsPreview({ previews, accent }) {
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

  const accentStyle = { '--col-accent': col.accent, '--col-accent-rgb': col.accentRgb };

  return (
    <div
      className={`cc-card ${hovered ? 'cc-card--hovered' : ''}`}
      style={accentStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(v => !v)}
    >
      {/* Layers */}
      <div className="cc-card__bg" style={{ backgroundImage: `url(${col.bgImage})` }} />
      <div className="cc-card__grad" />

      {/* Resting face */}
      <div className="cc-card__face">
        <div className="cc-card__number">{col.number}</div>
        <div className="cc-card__icon" style={{ color: col.accent }}>
          {col.icon}
        </div>
        <h3 className="cc-card__title">{col.title}</h3>
        <p className="cc-card__desc">{col.desc}</p>
        <div className="cc-card__count">{col.count}</div>
        <div className="cc-card__cta">
          Explore <span>→</span>
        </div>
      </div>

      {/* Hover panel */}
      <div className="cc-card__hover">
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

        <button className="cc-card__btn">
          {col.btnLabel}
        </button>
      </div>
    </div>
  );
}

/* ── MAIN SECTION ── */
export default function CollectionCarousel() {
  const ref = useRef(null);

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

        <div className="cc-track">
          {collections.map(col => (
            <CollectionCard key={col.id} col={col} />
          ))}
        </div>
      </div>
    </section>
  );
}
