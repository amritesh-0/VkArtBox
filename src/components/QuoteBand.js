import React, { useEffect, useRef } from 'react';
import './QuoteBand.css';

export default function QuoteBand() {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal');
    if (!els) return;
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.2 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="quote-band" ref={ref}>
      <div className="quote-band__inner">
        <blockquote className="quote-band__text reveal">
          <span className="quote-band__mark">"</span>
          Great things are not done by impulse but by a series of small things brought together.
        </blockquote>
        <div className="quote-band__author reveal reveal-delay-1">— Vincent Van Gogh</div>
        <div className="quote-band__line reveal reveal-delay-2" />
      </div>
    </section>
  );
}
