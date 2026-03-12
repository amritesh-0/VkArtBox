import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';
import './CareerApplication.css';

const ROLE_OPTIONS = [
    'Artist',
    'Digital Marketing',
    'Part-Time Content Writer',
    'Social Media Manager',
    'General Application',
];

export default function CareerApplication() {
    const [searchParams] = useSearchParams();
    const initialRole = searchParams.get('role');
    const [submitting, setSubmitting] = useState(false);
    const [submitState, setSubmitState] = useState({ success: false, message: '' });
    const [resumeFile, setResumeFile] = useState(null);
    const [formData, setFormData] = useState({
        role: '',
        fullName: '',
        email: '',
        phone: '',
        location: '',
        portfolioUrl: '',
        experience: '',
        coverLetter: '',
    });

    useEffect(() => {
        if (!initialRole) return;
        setFormData((prev) => ({
            ...prev,
            role: prev.role || initialRole,
        }));
    }, [initialRole]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const selectedRole = useMemo(() => formData.role || 'General Application', [formData.role]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setResumeFile(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!resumeFile) {
            setSubmitState({ success: false, message: 'Please attach your resume before submitting.' });
            return;
        }

        setSubmitting(true);
        setSubmitState({ success: false, message: '' });

        try {
            const safeName = formData.fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const resumeRef = ref(storage, `career-applications/${Date.now()}-${safeName || 'candidate'}-${resumeFile.name}`);
            await uploadBytes(resumeRef, resumeFile);

            await addDoc(collection(db, 'careerApplications'), {
                role: formData.role || 'General Application',
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                location: formData.location.trim(),
                portfolioUrl: formData.portfolioUrl.trim(),
                experience: formData.experience.trim(),
                coverLetter: formData.coverLetter.trim(),
                resumeFileName: resumeFile.name,
                resumePath: resumeRef.fullPath,
                status: 'New',
                submittedAt: serverTimestamp(),
            });

            setFormData({
                role: initialRole || '',
                fullName: '',
                email: '',
                phone: '',
                location: '',
                portfolioUrl: '',
                experience: '',
                coverLetter: '',
            });
            setResumeFile(null);
            setSubmitState({
                success: true,
                message: 'Application submitted successfully. Our team will review it shortly.',
            });
        } catch (error) {
            console.error('Error submitting career application:', error);
            setSubmitState({
                success: false,
                message: error.message || 'Failed to submit application. Please try again.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="career-application-page">
            <section className="career-application-hero">
                <span className="career-application-kicker">Career Application</span>
                <h1>Apply for {selectedRole}</h1>
                <p>
                    Send your application directly to our hiring pipeline. Every submission is stored in Firebase and reviewed from the admin panel.
                </p>
            </section>

            <section className="career-application-shell">
                <div className="career-application-aside">
                    <h2>Before You Apply</h2>
                    <ul>
                        <li>Choose the role you want to apply for.</li>
                        <li>Share your portfolio if your work is visual or writing-based.</li>
                        <li>Upload a current resume in PDF or document format.</li>
                    </ul>
                    <Link to="/careers" className="career-application-back">Back to Careers</Link>
                </div>

                <div className="career-application-card">
                    <form className="career-application-form" onSubmit={handleSubmit}>
                        <div className="career-form-grid">
                            <label>
                                <span>Applied Role *</span>
                                <select name="role" value={formData.role} onChange={handleChange} required>
                                    <option value="">Select a role</option>
                                    {ROLE_OPTIONS.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                <span>Full Name *</span>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </label>

                            <label>
                                <span>Email *</span>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </label>

                            <label>
                                <span>Phone *</span>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                            </label>

                            <label>
                                <span>Location</span>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} />
                            </label>

                            <label>
                                <span>Portfolio / LinkedIn</span>
                                <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://..." />
                            </label>
                        </div>

                        <label>
                            <span>Experience Summary</span>
                            <textarea name="experience" value={formData.experience} onChange={handleChange} rows="4" placeholder="Tell us about your relevant experience." />
                        </label>

                        <label>
                            <span>Why do you want to join VK ArtBox? *</span>
                            <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} rows="6" required placeholder="Write a short cover note." />
                        </label>

                        <label className="career-file-field">
                            <span>Resume *</span>
                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} required />
                            <strong>{resumeFile ? resumeFile.name : 'No file selected'}</strong>
                        </label>

                        {submitState.message && (
                            <div className={`career-form-message ${submitState.success ? 'success' : 'error'}`}>
                                {submitState.message}
                            </div>
                        )}

                        <button type="submit" className="btn-gold career-submit-btn" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
