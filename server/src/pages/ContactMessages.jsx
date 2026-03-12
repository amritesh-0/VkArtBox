import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Mail, Trash2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';

const formatSubmittedAt = (submittedAt) => {
    if (!submittedAt) return '-';
    if (typeof submittedAt.toDate === 'function') {
        return submittedAt.toDate().toLocaleString();
    }
    return String(submittedAt);
};

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const messagesQuery = query(collection(db, 'contactMessages'), orderBy('submittedAt', 'desc'));
                const snapshot = await getDocs(messagesQuery);
                const messageData = snapshot.docs.map((messageDoc) => ({
                    id: messageDoc.id,
                    ...messageDoc.data(),
                }));
                setMessages(messageData);
            } catch (error) {
                console.error('Error fetching contact messages:', error);
                toast.error('Failed to load contact messages.');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    const handleDelete = async (message) => {
        if (!window.confirm(`Delete message from ${message.fullName}?`)) {
            return;
        }

        const toastId = toast.loading('Deleting contact message...');
        try {
            await deleteDoc(doc(db, 'contactMessages', message.id));
            setMessages((prev) => prev.filter((item) => item.id !== message.id));
            setSelectedMessage((prev) => (prev?.id === message.id ? null : prev));
            toast.success('Contact message deleted successfully.', { id: toastId });
        } catch (error) {
            console.error('Error deleting contact message:', error);
            toast.error('Failed to delete contact message.', { id: toastId });
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Contact Messages</h2>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div className="empty-state">Loading contact messages...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">No contact messages submitted yet.</div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="admin-table submissions-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Subject</th>
                                        <th>Email</th>
                                        <th>Submitted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {messages.map((message) => (
                                        <tr key={message.id}>
                                            <td className="font-medium">{message.fullName}</td>
                                            <td>{message.subject || 'No subject'}</td>
                                            <td>{message.email}</td>
                                            <td>{formatSubmittedAt(message.submittedAt)}</td>
                                            <td>
                                                <button className="btn-primary btn-primary--compact" onClick={() => setSelectedMessage(message)}>
                                                    View
                                                </button>
                                                <button className="btn-icon-danger btn-icon-danger--inline" onClick={() => handleDelete(message)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {selectedMessage && (
                            <div className="detail-modal-backdrop" onClick={() => setSelectedMessage(null)}>
                                <article className="detail-modal" onClick={(event) => event.stopPropagation()}>
                                    <div className="detail-modal__header">
                                        <div>
                                            <p className="application-card__eyebrow">Subject</p>
                                            <h3>{selectedMessage.subject || 'No subject'}</h3>
                                        </div>
                                        <div className="detail-modal__actions">
                                            <button type="button" className="btn-icon-danger btn-icon-danger--inline" onClick={() => handleDelete(selectedMessage)}>
                                                <Trash2 size={16} />
                                            </button>
                                            <button type="button" className="detail-modal__close" onClick={() => setSelectedMessage(null)}>×</button>
                                        </div>
                                    </div>

                                    <div className="detail-modal__content">
                                        <div className="application-card__meta">
                                            <span><UserRound size={15} /> {selectedMessage.fullName}</span>
                                            <span><Mail size={15} /> {selectedMessage.email}</span>
                                        </div>

                                        <div className="application-card__section">
                                            <h4>Message</h4>
                                            <p>{selectedMessage.message}</p>
                                        </div>

                                        <div className="application-card__footer">
                                            <span>Submitted: {formatSubmittedAt(selectedMessage.submittedAt)}</span>
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

export default ContactMessages;
