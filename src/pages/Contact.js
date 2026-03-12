import React, { useEffect, useRef, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SOCIAL_LINKS, SocialIcon } from '../components/SocialLinks';
import './Contact.css';

export default function Contact() {
    const sectionRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState({ success: false, message: '' });
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: '',
    });

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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitState({ success: false, message: '' });

        try {
            await addDoc(collection(db, 'contactMessages'), {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                status: 'New',
                submittedAt: serverTimestamp(),
            });

            setFormData({
                fullName: '',
                email: '',
                subject: '',
                message: '',
            });
            setSubmitState({
                success: true,
                message: 'Thank you for reaching out. We will get back to you soon.',
            });
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setSubmitState({
                success: false,
                message: error.message || 'Failed to send message. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
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
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="contact-soc-link"
                                    aria-label={social.label}
                                    title={social.label}
                                >
                                    <SocialIcon type={social.key} className="contact-soc-icon" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="contact-card reveal">
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Your name here" required />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hello@example.com" required />
                        </div>

                        <div className="form-group">
                            <label>Subject</label>
                            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="What are you looking for?" required />
                        </div>

                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Tell us about your requirements..." required />
                        </div>

                        {submitState.message && (
                            <div className={`contact-form-message ${submitState.success ? 'success' : 'error'}`}>
                                {submitState.message}
                            </div>
                        )}

                        <button type="submit" className="contact-submit" disabled={submitting}>
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
