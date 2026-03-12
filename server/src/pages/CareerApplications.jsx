import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db } from '../firebase';
import { storage } from '../firebase';
import { BriefcaseBusiness, ExternalLink, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const formatSubmittedAt = (submittedAt) => {
    if (!submittedAt) return '-';
    if (typeof submittedAt.toDate === 'function') {
        return submittedAt.toDate().toLocaleString();
    }
    return String(submittedAt);
};

const CareerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const applicationsQuery = query(collection(db, 'careerApplications'), orderBy('submittedAt', 'desc'));
                const snapshot = await getDocs(applicationsQuery);
                const applicationData = await Promise.all(snapshot.docs.map(async (applicationDoc) => {
                    const data = applicationDoc.data();
                    let resumeUrl = data.resumeUrl || '';

                    if (!resumeUrl && data.resumePath) {
                        try {
                            resumeUrl = await getDownloadURL(ref(storage, data.resumePath));
                        } catch (resumeError) {
                            console.error('Error resolving resume download URL:', resumeError);
                        }
                    }

                    return {
                        id: applicationDoc.id,
                        ...data,
                        resumeUrl,
                    };
                }));
                setApplications(applicationData);
            } catch (error) {
                console.error('Error fetching career applications:', error);
                toast.error('Failed to load career applications.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleDelete = async (application) => {
        if (!window.confirm(`Delete application from ${application.fullName}?`)) {
            return;
        }

        const toastId = toast.loading('Deleting application...');
        try {
            await deleteDoc(doc(db, 'careerApplications', application.id));
            setApplications((prev) => prev.filter((item) => item.id !== application.id));
            setSelectedApplication((prev) => (prev?.id === application.id ? null : prev));
            toast.success('Application deleted successfully.', { id: toastId });
        } catch (error) {
            console.error('Error deleting application:', error);
            toast.error('Failed to delete application.', { id: toastId });
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Career Applications</h2>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div className="empty-state">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="empty-state">No career applications submitted yet.</div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="admin-table submissions-table">
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applications.map((application) => (
                                        <tr key={application.id}>
                                            <td className="font-medium">{application.fullName}</td>
                                            <td>{application.role || 'General Application'}</td>
                                            <td>{application.email}</td>
                                            <td>{formatSubmittedAt(application.submittedAt)}</td>
                                            <td>
                                                <button className="btn-primary btn-primary--compact" onClick={() => setSelectedApplication(application)}>
                                                    View
                                                </button>
                                                <button className="btn-icon-danger btn-icon-danger--inline" onClick={() => handleDelete(application)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedApplication && (
                            <div className="detail-modal-backdrop" onClick={() => setSelectedApplication(null)}>
                                <article className="detail-modal" onClick={(event) => event.stopPropagation()}>
                                    <div className="detail-modal__header">
                                        <div>
                                            <p className="application-card__eyebrow">Applied Role</p>
                                            <h3>{selectedApplication.role || 'General Application'}</h3>
                                        </div>
                                        <div className="detail-modal__actions">
                                            <button type="button" className="btn-icon-danger btn-icon-danger--inline" onClick={() => handleDelete(selectedApplication)}>
                                                <Trash2 size={16} />
                                            </button>
                                            <button type="button" className="detail-modal__close" onClick={() => setSelectedApplication(null)}>×</button>
                                        </div>
                                    </div>

                                    <div className="detail-modal__content">
                                        <div className="application-card__meta">
                                            <span><BriefcaseBusiness size={15} /> {selectedApplication.fullName}</span>
                                            <span><Mail size={15} /> {selectedApplication.email}</span>
                                            {selectedApplication.phone && <span><Phone size={15} /> {selectedApplication.phone}</span>}
                                            {selectedApplication.location && <span><MapPin size={15} /> {selectedApplication.location}</span>}
                                        </div>

                                        <div className="detail-modal__links">
                                            {selectedApplication.portfolioUrl && (
                                                <a
                                                    className="application-card__link"
                                                    href={selectedApplication.portfolioUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Portfolio / LinkedIn <ExternalLink size={14} />
                                                </a>
                                            )}

                                            {selectedApplication.resumeUrl && (
                                                <a
                                                    className="application-card__link"
                                                    href={selectedApplication.resumeUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View Resume {selectedApplication.resumeFileName ? `(${selectedApplication.resumeFileName})` : ''} <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>

                                        {selectedApplication.experience && (
                                            <div className="application-card__section">
                                                <h4>Experience</h4>
                                                <p>{selectedApplication.experience}</p>
                                            </div>
                                        )}

                                        {selectedApplication.coverLetter && (
                                            <div className="application-card__section">
                                                <h4>Cover Note</h4>
                                                <p>{selectedApplication.coverLetter}</p>
                                            </div>
                                        )}

                                        <div className="application-card__footer">
                                            <span>Submitted: {formatSubmittedAt(selectedApplication.submittedAt)}</span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CareerApplications;
