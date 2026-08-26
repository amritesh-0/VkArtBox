import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { CalendarDays, Download, IndianRupee, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const timestampToDate = (timestamp) => (typeof timestamp?.toDate === 'function' ? timestamp.toDate() : null);
const formatRegisteredAt = (registeredAt) => timestampToDate(registeredAt)?.toLocaleString() || '-';
const formatDateForExport = (registeredAt) => timestampToDate(registeredAt)?.toISOString() || '';
const safeCsvCell = (value) => {
    const text = String(value ?? '');
    const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${protectedText.replace(/"/g, '""')}"`;
};

const WebinarRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [activeEvent, setActiveEvent] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const [webinarSnap, workshopSnap] = await Promise.all([
                    getDocs(query(collection(db, 'webinarRegistrations'), orderBy('registeredAt', 'desc'))).catch(() => ({ docs: [] })),
                    getDocs(query(collection(db, 'workshopRegistrations'), orderBy('registeredAt', 'desc'))).catch(() => ({ docs: [] }))
                ]);
                const combinedMap = new Map();
                [...workshopSnap.docs, ...webinarSnap.docs].forEach((docSnap) => {
                    if (!combinedMap.has(docSnap.id)) {
                        combinedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
                    }
                });
                setRegistrations(Array.from(combinedMap.values()));
            } catch (error) {
                console.error('Error fetching workshop registrations:', error);
                toast.error('Failed to load workshop registrations.');
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    const events = useMemo(() => [...new Set(registrations.map(({ event }) => event).filter(Boolean))].sort(), [registrations]);
    const visibleRegistrations = useMemo(() => registrations
        .filter((registration) => activeEvent === 'all' || registration.event === activeEvent)
        .sort((first, second) => {
            const difference = (timestampToDate(second.registeredAt)?.getTime() || 0) - (timestampToDate(first.registeredAt)?.getTime() || 0);
            return sortOrder === 'newest' ? difference : -difference;
        }), [activeEvent, registrations, sortOrder]);

    const exportRegistrations = () => {
        if (!visibleRegistrations.length) return;
        const rows = [
            ['Name', 'Email', 'Phone', 'Webinar', 'Amount (INR)', 'Payment ID', 'Order ID', 'Registration date'],
            ...visibleRegistrations.map((registration) => [
                registration.name, registration.email, registration.phone, registration.event,
                ((registration.amount || 0) / 100).toFixed(2), registration.razorpayPaymentId,
                registration.razorpayOrderId, formatDateForExport(registration.registeredAt),
            ]),
        ];
        const csv = `\uFEFF${rows.map((row) => row.map(safeCsvCell).join(',')).join('\n')}`;
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeEvent === 'all' ? 'all-webinar-registrations' : activeEvent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-registrations.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="page-header webinar-registrations__header">
                <div><h2>Workshop Registrations</h2><p>Paid attendees, grouped by workshop event.</p></div>
                <button className="btn-primary" type="button" disabled={!visibleRegistrations.length} onClick={exportRegistrations}>
                    <Download size={17} /> Export for Excel
                </button>
            </div>
            <div className="admin-card">
                {loading ? <div className="empty-state">Loading webinar registrations...</div> : registrations.length === 0 ? (
                    <div className="empty-state">No paid webinar registrations yet.</div>
                ) : (
                    <>
                        <div className="webinar-event-tabs" role="tablist" aria-label="Filter registrations by webinar">
                            <button type="button" role="tab" aria-selected={activeEvent === 'all'} className={activeEvent === 'all' ? 'active' : ''} onClick={() => setActiveEvent('all')}>All webinars <span>{registrations.length}</span></button>
                            {events.map((event) => {
                                const count = registrations.filter((registration) => registration.event === event).length;
                                return <button key={event} type="button" role="tab" aria-selected={activeEvent === event} className={activeEvent === event ? 'active' : ''} onClick={() => setActiveEvent(event)}>{event} <span>{count}</span></button>;
                            })}
                        </div>
                        <div className="webinar-registrations__toolbar">
                            <span>{visibleRegistrations.length} registration{visibleRegistrations.length === 1 ? '' : 's'}</span>
                            <label>Sort by date<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
                        </div>
                        <div className="table-container">
                            <table className="admin-table submissions-table">
                                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Paid</th><th>Registered</th></tr></thead>
                                <tbody>{visibleRegistrations.map((registration) => (
                                    <tr key={registration.id}>
                                        <td className="font-medium"><UserRound size={15} /> {registration.name}</td>
                                        <td><a href={`mailto:${registration.email}`}>{registration.email}</a></td>
                                        <td><a href={`tel:${registration.phone}`}>{registration.phone}</a></td>
                                        <td><IndianRupee size={14} /> {(registration.amount || 0) / 100}</td>
                                        <td><CalendarDays size={15} /> {formatRegisteredAt(registration.registeredAt)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WebinarRegistrations;
