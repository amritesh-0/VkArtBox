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
            description: 'We believe in giving our artists the space to experiment, fail, and ultimately create something extraordinary.',
            icon: '🎨'
        },
        {
            title: 'Continuous Growth',
            description: 'Learn new techniques and refine your craft alongside a family of dedicated creators.',
            icon: '🌿'
        },
        {
            title: 'Meaningful Impact',
            description: 'Your work brings joy to people\'s homes and captures memories that last a lifetime.',
            icon: '✨'
        }
    ];

    const positions = [
        {
            title: 'Fine Artist (Portraiture)',
            type: 'Full-time / Remote',
            location: 'Indore / India',
            description: 'We are looking for master sketch artists specialized in charcoal and graphite portraits.'
        },
        {
            title: 'Digital illustrator',
            type: 'Contract',
            location: 'Remote',
            description: 'Help us translate traditional textures into digital masterpieces for our unique collections.'
        },
        {
            title: 'Art Consultant',
            type: 'Part-time',
            location: 'Indore, M.P.',
            description: 'Guide our clients through the process of commissioning their perfect custom artwork.'
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
                            <span className="value-icon">{v.icon}</span>
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
