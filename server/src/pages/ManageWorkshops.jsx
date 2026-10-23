import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { CheckCircle2, IndianRupee, Presentation, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase';

const defaultWorkshops = [
    { id: 'workshop-default', title: 'VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept', price: 2499, duration: '8-Day Live Online Masterclass', isLive: true },
    { id: 'workshop-starter-drawing', title: 'A 2-Day Basic Drawing Starter Workshop', price: 999, duration: '2-Day Live Online Workshop', isLive: false },
];

export default function ManageWorkshops() {
    const [workshops, setWorkshops] = useState(defaultWorkshops);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadWorkshopSettings = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'workshops'));
            const savedById = new Map(snapshot.docs.map((docSnap) => [docSnap.id, docSnap.data()]));
            setWorkshops(defaultWorkshops.map((fallback) => ({ ...fallback, ...savedById.get(fallback.id), id: fallback.id })));
        } catch (error) {
            console.error('Error loading workshop settings:', error);
            toast.error('Could not load saved workshop settings. Showing defaults.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadWorkshopSettings(); }, []);

    const updateWorkshop = (id, field, value) => setWorkshops((current) => current.map((workshop) => workshop.id === id ? { ...workshop, [field]: value } : workshop));
    const setLiveWorkshop = (id) => setWorkshops((current) => current.map((workshop) => ({ ...workshop, isLive: workshop.id === id })));

    const handleSave = async (event) => {
        event.preventDefault();
        const activeWorkshop = workshops.find((workshop) => workshop.isLive);
        if (!activeWorkshop || workshops.some((workshop) => !workshop.title.trim() || !Number.isFinite(Number(workshop.price)) || Number(workshop.price) <= 0)) {
            toast.error('Choose one live workshop and enter a valid title and price for both workshops.');
            return;
        }
        if (!auth?.currentUser) return toast.error('Your admin session has expired. Please sign in again.');

        setUpdating(true);
        const toastId = toast.loading('Saving workshop settings...');
        try {
            const apiOrigin = (import.meta.env.VITE_PUBLIC_API_ORIGIN || '').replace(/\/$/, '');
            const response = await fetch(`${apiOrigin}/api/update-workshop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await auth.currentUser.getIdToken()}` },
                body: JSON.stringify({ activeWorkshopId: activeWorkshop.id, workshops: workshops.map(({ id, title, price }) => ({ id, title: title.trim(), price: Number(price) })) }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.message || 'Unable to update workshop settings.');
            toast.success('Live workshop and pricing are now updated.', { id: toastId });
            await loadWorkshopSettings();
        } catch (error) {
            console.error('Error updating workshops:', error);
            toast.error(error.message || 'Failed to update workshop settings.', { id: toastId });
        } finally {
            setUpdating(false);
        }
    };

    return <div>
        <div className="page-header"><h2>Manage Workshops</h2><p>Keep both workshops ready and choose the one visitors can register for.</p></div>
        <form className="admin-form" onSubmit={handleSave}>
            {loading ? <div className="empty-state">Loading workshop details...</div> : workshops.map((workshop) => (
                <section className="admin-card" key={workshop.id} style={{ marginBottom: '20px', border: workshop.isLive ? '2px solid var(--admin-gold)' : undefined }}>
                    <div className="webinar-editor__heading" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                        <div><h3><Presentation size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--admin-gold)' }} />{workshop.duration}</h3>{workshop.isLive && <p style={{ color: 'var(--admin-gold)', margin: '6px 0 0' }}><CheckCircle2 size={15} style={{ verticalAlign: 'middle' }} /> Currently live on the website</p>}</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}><input type="radio" name="live-workshop" checked={workshop.isLive} onChange={() => setLiveWorkshop(workshop.id)} /> Make live</label>
                    </div>
                    <div className="form-group" style={{ marginBottom: '18px' }}><label>Workshop title</label><input value={workshop.title} onChange={(event) => updateWorkshop(workshop.id, 'title', event.target.value)} required maxLength="160" /></div>
                    <div className="form-group" style={{ maxWidth: '320px' }}><label style={{ display: 'flex', gap: '6px', alignItems: 'center' }}><IndianRupee size={16} /> Price (₹)</label><input type="number" min="1" max="100000" step="1" value={workshop.price} onChange={(event) => updateWorkshop(workshop.id, 'price', event.target.value)} required /></div>
                </section>
            ))}
            {!loading && <div className="form-actions"><button className="btn-primary" type="submit" disabled={updating}><Save size={18} /> {updating ? 'Saving Changes...' : 'Save Workshop Settings'}</button></div>}
        </form>
    </div>;
}
