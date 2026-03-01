import React, { useEffect, useRef } from 'react';
import './About.css';

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('.reveal');
    if (!els) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const tags = ['Pencil Portraits', 'Charcoal', 'Graphite', 'Colour Pencil', 'Wildlife', 'Fine Art'];

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about__inner">
        <div className="about__text reveal">
          <p className="about__tag">Made with Love · Indore, M.P.</p>
          <h2 className="about__title">
            A Family of<br /><em>Creators</em>
          </h2>
          <p className="about__body">
            We are a family of creators — precised drawing — penup with complete morality
            at our space in Madhya Pradesh, India. We make beautiful drawings for you with
            enormous love and quality, because we believe each one is a representation of
            our art which we closely knit.
          </p>
          <p className="about__body">
            VK ArtBox was founded on the belief that great art is not made by impulse —
            but by a series of small, deliberate choices brought together with devotion.
          </p>
          <div className="about__tags">
            {tags.map(t => <span key={t} className="about__tag-pill">{t}</span>)}
          </div>
        </div>

        <div className="about__visual reveal reveal-delay-2">
          <div className="about__quote-card">
            <p className="about__quote-text">
              Great things are not done by impulse but by a series of small things brought together.
            </p>
            <p className="about__quote-attr">— Vincent Van Gogh</p>
          </div>
        </div>
      </div>
    </section>
  );
}
