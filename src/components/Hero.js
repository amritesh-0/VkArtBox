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

      <div className="hero__content">
        <div className="hero__top">
          <div className="hero__tagline">
            <span className="hero__tagline-line" />
            Handcrafted Fine Art · India
          </div>
          <h1 className="hero__title">
            Creative <em>Mesmerizing</em><br />
            Masterpieces
          </h1>
        </div>

        <div className="hero__center">
          <div className="hero__image-wrap">
            <div className="hero__img-box" ref={imgRef}>
              <img src={saraswatiImg} alt="Goddess Saraswati — VkArtBox" />
              <div className="hero__img-overlay" />
            </div>
          </div>
        </div>

        <div className="hero__bottom">
          <p className="hero__body">
            Hand-drawn visions captured on paper. Each stroke a deliberate act of devotion, crafted with precision in the heart of Madhya Pradesh.
          </p>

          <div className="hero__btns">
            <button className="btn-gold" onClick={() => scrollTo('collections')}>
              View Collection
            </button>
            <button className="btn-outline" onClick={() => scrollTo('about')}>
              Our Story
            </button>
          </div>

          <div className="hero__quote-box">
            <p className="hero__quote">
              "We make beautiful drawings for you with enormous love and quality"
            </p>
            <span className="hero__author">— VK ArtBox, Indore</span>
          </div>
        </div>

        <button className="hero__scroll-btn" onClick={() => scrollTo('about')}>
          <span>Explore</span>
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <line x1="10" y1="0" x2="10" y2="24" stroke="currentColor" strokeWidth="1.5" />
            <polyline points="4,18 10,26 16,18" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
      </div>
    </section>
  );
}
