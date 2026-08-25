import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { CalendarDays, IndianRupee, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const formatRegisteredAt = (registeredAt) => {
    if (!registeredAt) return '-';
    return typeof registeredAt.toDate === 'function' ? registeredAt.toDate().toLocaleString() : String(registeredAt);
};

const WebinarRegistrations = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const registrationsQuery = query(collection(db, 'webinarRegistrations'), orderBy('registeredAt', 'desc'));
                const snapshot = await getDocs(registrationsQuery);
                setRegistrations(snapshot.docs.map((registration) => ({ id: registration.id, ...registration.data() })));
            } catch (error) {
                console.error('Error fetching webinar registrations:', error);
                toast.error('Failed to load webinar registrations.');
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h2>Webinar Registrations</h2>
            </div>
            <div className="admin-card">
                {loading ? <div className="empty-state">Loading webinar registrations...</div> : registrations.length === 0 ? (
                    <div className="empty-state">No paid webinar registrations yet.</div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table submissions-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Event</th><th>Paid</th><th>Registered</th></tr></thead>
                            <tbody>{registrations.map((registration) => (
                                <tr key={registration.id}>
                                    <td className="font-medium"><UserRound size={15} /> {registration.name}</td>
                                    <td><a href={`mailto:${registration.email}`}>{registration.email}</a></td>
                                    <td><a href={`tel:${registration.phone}`}>{registration.phone}</a></td>
                                    <td>{registration.event}</td>
                                    <td><IndianRupee size={14} /> {(registration.amount || 0) / 100}</td>
                                    <td><CalendarDays size={15} /> {formatRegisteredAt(registration.registeredAt)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebinarRegistrations;
