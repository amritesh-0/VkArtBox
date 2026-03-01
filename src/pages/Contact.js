import React, { useEffect, useRef } from 'react';
import './Contact.css';

export default function Contact() {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for reaching out! We will get back to you soon.');
    };

    return (
        <div className="contact-page" ref={sectionRef}>
            <div className="contact-container">
                {/* Left Side: Info */}
                <div className="contact-info reveal">
                    <div className="contact-header">
                        <div className="contact-eyebrow">Contact Us</div>
                        <h2 className="contact-title">Let's <em>Connect</em></h2>
                    </div>

                    <div className="info-item">
                        <h4>Location</h4>
                        <p>
                            A502 Classic Swastik City,<br />
                            Mangal Nagar, Indore<br />
                            Madhya Pradesh, India
                        </p>
                    </div>

                    <div className="info-item">
                        <h4>General Inquiries</h4>
                        <a href="mailto:mail@vkartbox.com">mail@vkartbox.com</a>
                    </div>

                    <div className="info-item">
                        <h4>Follow Our Journey</h4>
                        <div className="contact-socials">
                            {['Ig', 'Fb', 'Tw', 'Pt'].map(s => (
                                <button key={s} className="contact-soc-link" onClick={() => { }}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="contact-card reveal">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" placeholder="Your name here" required />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" placeholder="hello@example.com" required />
                        </div>

                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" placeholder="What are you looking for?" required />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea rows="5" placeholder="Tell us about your requirements..." required />
                        </div>

                        <button type="submit" className="contact-submit">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
