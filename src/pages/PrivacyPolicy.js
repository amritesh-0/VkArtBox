import React, { useEffect, useRef } from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
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

    return (
        <div className="privacy-page" ref={sectionRef}>
            <div className="privacy-container reveal">
                <header className="section-header">
                    <div className="section-eyebrow">Legal</div>
                    <h1 className="section-title">Privacy <em>Policy</em></h1>
                    <p className="privacy-date">Last Updated: May 16, 2026</p>
                </header>

                <div className="privacy-content">
                    <section className="reveal reveal-delay-1">
                        <h2>Introduction</h2>
                        <p>Welcome to VkArtBox. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section className="reveal reveal-delay-2">
                        <h2>Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul>
                            <li><strong>Identity Data:</strong> includes first name, last name.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.</li>
                        </ul>
                    </section>

                    <section className="reveal reveal-delay-3">
                        <h2>How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul>
                            <li>To process your inquiries via our contact form.</li>
                            <li>To manage our relationship with you.</li>
                            <li>To improve our website, products/services, and experiences.</li>
                        </ul>
                    </section>

                    <section className="reveal reveal-delay-4">
                        <h2>Contact Information</h2>
                        <p>If you have any questions about this privacy policy, please contact us at:</p>
                        <p className="privacy-contact-box">
                            Email: <strong>mail@vkartbox.com</strong><br />
                            Address: A502 Classic Swastik City, Indore, India
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
