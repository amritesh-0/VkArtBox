import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Save, Tag, IndianRupee, Heading } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase';

export default function ManageWorkshops() {
    const [quickTitle, setQuickTitle] = useState('VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept');
    const [quickPrice, setQuickPrice] = useState('2499');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadWorkshopSettings = async () => {
        try {
            // Check workshops or webinars collection for existing title & price
            const [workshopSnap, webinarSnap] = await Promise.all([
                getDocs(collection(db, 'workshops')).catch(() => ({ docs: [] })),
                getDocs(collection(db, 'webinars')).catch(() => ({ docs: [] }))
            ]);

            const docsList = [...workshopSnap.docs, ...webinarSnap.docs];
            if (docsList.length > 0) {
                const firstData = docsList[0].data();
                if (firstData?.title) setQuickTitle(firstData.title);
                if (firstData?.price) setQuickPrice(String(firstData.price));
            }
        } catch (error) {
            console.error('Error loading workshop settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWorkshopSettings();
    }, []);

    const handleUpdateTitleAndPrice = async (event) => {
        event.preventDefault();
        const priceNum = Number(quickPrice);
        if (!quickTitle.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
            toast.error('Please enter a valid title and price.');
            return;
        }

        setUpdating(true);
        const toastId = toast.loading('Updating Workshop Title & Price...');

        try {
            // Call API endpoint
            const apiOrigin = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').replace(/\/$/, '');
            const res = await fetch(`${apiOrigin}/api/update-workshop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
                },
                body: JSON.stringify({
                    title: quickTitle.trim(),
                    price: priceNum,
                    workshopId: 'workshop-default'
                })
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload.message || 'Unable to update workshop settings.');
            }
            toast.success('Workshop title and price updated successfully!', { id: toastId });
            await loadWorkshopSettings();
        } catch (error) {
            console.error('Error updating title/price:', error);
            toast.error(error.message || 'Failed to update title and price.', { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Manage Workshop Settings</h2>
                <p>Update title and pricing for the 8-Day Portrait Drawing Workshop.</p>
            </div>

            <section className="admin-card">
                <div className="webinar-editor__heading" style={{ marginBottom: '20px' }}>
                    <h3>
                        <Tag size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--admin-gold)' }} />
                        Workshop Title & Price Settings
                    </h3>
                </div>

                {loading ? (
                    <div className="empty-state">Loading workshop details...</div>
                ) : (
                    <form className="admin-form" onSubmit={handleUpdateTitleAndPrice}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                <Heading size={16} /> Workshop Title
                            </label>
                            <input
                                value={quickTitle}
                                onChange={(e) => setQuickTitle(e.target.value)}
                                placeholder="VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept"
                                required
                                style={{ fontSize: '1rem', padding: '12px' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px', maxWidth: '320px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                <IndianRupee size={16} /> Workshop Price (₹)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quickPrice}
                                onChange={(e) => setQuickPrice(e.target.value)}
                                placeholder="2499"
                                required
                                style={{ fontSize: '1.1rem', padding: '12px' }}
                            />
                        </div>

                        <div className="form-actions">
                            <button className="btn-primary" type="submit" disabled={updating}>
                                <Save size={18} /> {updating ? 'Saving Changes...' : 'Save Title & Price'}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
