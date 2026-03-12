import React, { useEffect, useRef } from 'react';
import './Careers.css';

export default function Careers() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const els = sectionRef.current?.querySelectorAll('.reveal');
        if (!els) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
            { threshold: 0.1 }
        );
        els.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const values = [
        {
            title: 'Creative Freedom',
            description: 'We believe in giving our artists the space to experiment, fail, and ultimately create something extraordinary.'
        },
        {
            title: 'Continuous Growth',
            description: 'Learn new techniques and refine your craft alongside a family of dedicated creators.'
        },
        {
            title: 'Meaningful Impact',
            description: 'Your work brings joy to people\'s homes and captures memories that last a lifetime.'
        }
    ];

    const positions = [
        {
            title: 'Artist',
            type: 'Full-time',
            location: 'Indore / India',
            description: 'We are looking for skilled artists who can create high-quality custom artwork with strong drawing fundamentals and attention to detail.'
        },
        {
            title: 'Digital Marketing',
            type: 'Full-time',
            location: 'Remote',
            description: 'Help grow VkArtBox through campaign planning, audience engagement, performance tracking, and creative digital promotion.'
        },
        {
            title: 'Part-Time Content Writer',
            type: 'Part-time',
            location: 'Remote',
            description: 'Create engaging content for blogs, captions, product storytelling, and brand communication aligned with our artistic voice.'
        },
        {
            title: 'Social Media Manager',
            type: 'Full-time',
            location: 'Remote / Indore',
            description: 'Manage social platforms, content calendars, posting strategy, and community interactions to strengthen our online presence.'
        }
    ];

    return (
        <div className="careers-page" ref={sectionRef}>
            {/* Hero Section */}
            <header className="careers-hero reveal">
                <div className="section-eyebrow">Careers</div>
                <h1 className="section-title">Join Our Family of<br /><em>Creators</em></h1>
                <p className="careers-hero-text">
                    At VK ArtBox, we don't just draw; we capture souls. Join us in our journey
                    to bring the traditional beauty of fine art to the modern world.
                </p>
            </header>

            {/* Why Join Us */}
            <section className="careers-values reveal reveal-delay-1">
                <div className="section-header">
                    <h2 className="section-title">Why <em>Join</em> Us?</h2>
                </div>
                <div className="values-grid">
                    {values.map((v, i) => (
                        <div key={i} className="value-card">
                            <h3>{v.title}</h3>
                            <p>{v.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Open Positions */}
            <section className="careers-positions reveal reveal-delay-2">
                <div className="section-header">
                    <h2 className="section-title">Open <em>Positions</em></h2>
                    <p className="section-subtitle">Find your place in our creative ecosystem</p>
                </div>
                <div className="positions-list">
                    {positions.map((p, i) => (
                        <div key={i} className="position-card">
                            <div className="pos-info">
                                <h3>{p.title}</h3>
                                <div className="pos-meta">
                                    <span>{p.type}</span>
                                    <span className="dot">•</span>
                                    <span>{p.location}</span>
                                </div>
                                <p>{p.description}</p>
                            </div>
                            <button className="btn-outline">Apply Now</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application CTA */}
            <section className="careers-cta reveal reveal-delay-3">
                <div className="cta-content">
                    <h2 className="section-title">Don't see the <em>Right</em> Role?</h2>
                    <p>
                        We're always looking for exceptional talent. If you're passionate about art
                        and believe you'd be a great fit, reach out to us.
                    </p>
                    <a href="mailto:careers@vkartbox.com" className="btn-gold">Get In Touch</a>
                </div>
            </section>
        </div>
    );
}
