import React, { useEffect, useRef } from 'react';
import saraswatiImg from '../assets/Saraswati.jpeg';
import './Hero.css';

export default function Hero() {
  const imgRef = useRef(null);
  const raysRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      if (imgRef.current) {
        imgRef.current.style.transform = `translateX(${dx * 10}px) translateY(${dy * 10}px)`;
      }
      if (raysRef.current) {
        raysRef.current.style.transform = `rotate(${dx * 6}deg)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <div className="hero__shimmer" />
      <div className="hero__mandala" />
      <div className="hero__rays" ref={raysRef} />
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />
      <div className="hero__symbol hero__symbol--om">ॐ</div>
      <div className="hero__symbol hero__symbol--leaf">❧</div>
      <div className="hero__symbol hero__symbol--star">✦</div>

      <div className="hero__grid">
        {/* LEFT */}
        <div className="hero__left">
          <div className="hero__tagline">
            <span className="hero__tagline-line" />
            Handcrafted Fine Art · India
          </div>

          <h1 className="hero__title">
            A Selection of<br />
            Creative <em>Mesmerizing</em><br />
            Masterpieces.
          </h1>

          <p className="hero__body">
            Hand-drawn visions captured on paper. Each stroke a deliberate act of devotion, crafted with precision in the heart of Madhya Pradesh.
          </p>

          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-n">10+</span>
              <span className="hero__stat-l">Years of Art</span>
            </div>
            <div className="hero__stat-div" />
            <div className="hero__stat">
              <span className="hero__stat-n">200+</span>
              <span className="hero__stat-l">Masterpieces</span>
            </div>
            <div className="hero__stat-div" />
            <div className="hero__stat">
              <span className="hero__stat-n">100%</span>
              <span className="hero__stat-l">Handcrafted</span>
            </div>
          </div>

          <div className="hero__btns">
            <button className="btn-gold" onClick={() => scrollTo('portraits')}>
              View Collection
            </button>
            <button className="btn-outline" onClick={() => scrollTo('about')}>
              Our Story
            </button>
          </div>
        </div>

        {/* CENTER IMAGE */}
        <div className="hero__center">
          <div className="hero__image-wrap">
            {/* Arc SVG */}
            <svg className="hero__arc" viewBox="0 0 220 68" fill="none">
              <path d="M12 62 Q110 6 208 62" stroke="rgba(245,245,245,0.2)" strokeWidth="1" fill="none" />
              <path d="M28 56 Q110 16 192 56" stroke="rgba(210,105,30,0.15)" strokeWidth="0.5" fill="none" />
              <circle cx="110" cy="8" r="3.5" fill="rgba(210,105,30,0.3)" />
              <circle cx="65" cy="26" r="2" fill="rgba(245,245,245,0.12)" />
              <circle cx="155" cy="26" r="2" fill="rgba(245,245,245,0.12)" />
              <circle cx="28" cy="50" r="1.5" fill="rgba(245,245,245,0.1)" />
              <circle cx="192" cy="50" r="1.5" fill="rgba(245,245,245,0.1)" />
            </svg>

            {/* Rings */}
            <div className="hero__ring hero__ring--outer" />
            <div className="hero__ring hero__ring--inner" />

            {/* Corner ornaments */}
            <div className="hero__corner hero__corner--tl" />
            <div className="hero__corner hero__corner--tr" />
            <div className="hero__corner hero__corner--bl" />
            <div className="hero__corner hero__corner--br" />

            {/* Image */}
            <div className="hero__img-circle" ref={imgRef}>
              <img src={saraswatiImg} alt="Goddess Saraswati — VkArtBox" />
              <div className="hero__img-overlay" />
            </div>

            {/* <div className="hero__caption">
              ✦ Sarasvatī — Goddess of Knowledge &amp; Arts ✦
            </div> */}
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero__right">
          <div className="hero__attr">
            <div className="hero__attr-icon">🖋️</div>
            <div className="hero__attr-name">Pencil &amp; Penup</div>
            <div className="hero__attr-text">"Precised drawing crafted with morality — every stroke a deliberate act of devotion"</div>
          </div>
          <div className="hero__attr">
            <div className="hero__attr-icon">🎨</div>
            <div className="hero__attr-name">Fine Art</div>
            <div className="hero__attr-text">"Spanning illustration, lettering &amp; fine art — each a living fragment of the artist's soul"</div>
          </div>
          <div className="hero__attr">
            <div className="hero__attr-icon">🇮🇳</div>
            <div className="hero__attr-name">Made in India</div>
            <div className="hero__attr-text">"Crafted with love from Indore, M.P. — where tradition meets artistic precision"</div>
          </div>
          {/* <div className="hero__socials">
            <span className="hero__soc-label">Follow</span>
            {[
              { label: 'ig', href: 'https://www.instagram.com/vk_artbox/' },
              { label: 'fb', href: 'https://www.facebook.com/vkartbox' },
              { label: 'yt', href: 'https://www.youtube.com/vkartbox' },
              { label: 'pt', href: 'https://in.pinterest.com/vkartbox/' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hero__soc-link">
                {s.label}
              </a>
            ))}
          </div> */}
        </div>

        {/* FOOTER ROW */}
        <div className="hero__foot">
          <p className="hero__quote">
            "We make beautiful drawings for you with enormous love and quality, because we believe each one is a representation of our art which we closely knit."
            <strong>— VK ArtBox, Indore</strong>
          </p>
          <button className="hero__scroll-btn" onClick={() => scrollTo('about')}>
            <span>Explore</span>
            <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
              <line x1="10" y1="0" x2="10" y2="24" stroke="rgba(245,245,245,0.3)" strokeWidth="1.5" />
              <polyline points="4,18 10,26 16,18" stroke="rgba(210,105,30,0.5)" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
