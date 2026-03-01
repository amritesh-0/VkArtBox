import React, { useState, useRef, useEffect } from 'react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = () => {
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="newsletter" id="contact" ref={ref}>
      <div className="newsletter__inner">
        <div className="section-eyebrow reveal">Stay Connected</div>
        <h2 className="newsletter__title reveal reveal-delay-1">
          Sign up for the <em>Newsletter</em>
        </h2>
        <p className="newsletter__sub reveal reveal-delay-2">
          Be the first to know about new masterpieces, upcoming events, and
          behind-the-scenes glimpses into the VkArtBox studio.
        </p>

        {!submitted ? (
          <div className="newsletter__form reveal reveal-delay-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button onClick={handleSubmit}>Subscribe</button>
          </div>
        ) : (
          <div className="newsletter__success reveal">
            <span className="newsletter__check">✦</span>
            <span>Thank you — you're on the list.</span>
          </div>
        )}
      </div>
    </section>
  );
}
