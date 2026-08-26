import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Pencil, Plus, Trash2, X, Save, IndianRupee, Heading } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const blankWebinar = { title: '', description: '', date: '', time: '', price: '', isPublished: true };

export default function ManageWebinars() {
    const [webinars, setWebinars] = useState([]);
    const [form, setForm] = useState(blankWebinar);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Quick Title & Price Update State
    const [quickTitle, setQuickTitle] = useState('VKartbox Basic Graphite & Charcoal Workshop — 2026 Sept');
    const [quickPrice, setQuickPrice] = useState('2499');
    const [updatingQuick, setUpdatingQuick] = useState(false);

    const loadWebinars = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'webinars'));
            const list = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt?.seconds || 0).localeCompare(String(a.createdAt?.seconds || 0)));
            setWebinars(list);
            
            // Set initial quick update values if available
            if (list.length > 0) {
                if (list[0].title) setQuickTitle(list[0].title);
                if (list[0].price) setQuickPrice(String(list[0].price));
            }
        } catch (error) {
            console.error('Error loading workshop/webinars:', error);
            toast.error('Failed to load workshop data.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadWebinars(); }, []);

    const resetForm = () => { setForm(blankWebinar); setEditingId(null); };
    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

    // Handler for updating Title & Price via Endpoint / Firestore
    const handleUpdateTitleAndPrice = async (event) => {
        event.preventDefault();
        const priceNum = Number(quickPrice);
        if (!quickTitle.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
            toast.error('Please enter a valid title and price.');
            return;
        }

        setUpdatingQuick(true);
        const toastId = toast.loading('Updating Workshop Title & Price...');

        try {
            // First attempt to call the API endpoint
            const res = await fetch('/api/update-workshop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: quickTitle.trim(),
                    price: priceNum,
                    workshopId: 'workshop-default'
                })
            });

            if (res.ok) {
                toast.success('Workshop title and price updated successfully!', { id: toastId });
            } else {
                // Direct Firestore fallback if local dev server without backend API
                const firstId = webinars[0]?.id || 'workshop-default';
                await updateDoc(doc(db, 'webinars', firstId), {
                    title: quickTitle.trim(),
                    price: priceNum,
                    updatedAt: serverTimestamp()
                });
                toast.success('Workshop title and price updated directly in Firestore!', { id: toastId });
            }
            await loadWebinars();
        } catch (error) {
            console.error('Error updating title/price:', error);
            toast.error(error.message || 'Failed to update title and price.', { id: toastId });
        } finally {
            setUpdatingQuick(false);
        }
    };

    const saveWebinar = async (event) => {
        event.preventDefault();
        const price = Number(form.price);
        if (!form.title.trim() || !form.description.trim() || !form.date.trim() || !form.time.trim() || !Number.isFinite(price) || price <= 0) {
            toast.error('Enter the workshop title, details, date, time, and a valid price.');
            return;
        }
        setSaving(true);
        const toastId = toast.loading(editingId ? 'Updating workshop...' : 'Creating workshop...');
        const payload = { title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), time: form.time.trim(), price, isPublished: form.isPublished, updatedAt: serverTimestamp() };
        try {
            if (editingId) await updateDoc(doc(db, 'webinars', editingId), payload);
            else await addDoc(collection(db, 'webinars'), { ...payload, createdAt: serverTimestamp() });
            toast.success(editingId ? 'Workshop updated.' : 'Workshop created.', { id: toastId });
            resetForm();
            await loadWebinars();
        } catch (error) {
            console.error('Error saving workshop:', error);
            toast.error(error.message || 'Failed to save workshop.', { id: toastId });
        } finally { setSaving(false); }
    };

    const editWebinar = (webinar) => { setEditingId(webinar.id); setForm({ title: webinar.title || '', description: webinar.description || '', date: webinar.date || '', time: webinar.time || '', price: webinar.price || '', isPublished: Boolean(webinar.isPublished) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const removeWebinar = async (webinar) => {
        if (!window.confirm(`Delete “${webinar.title}”? Existing registration records will be kept.`)) return;
        try { await deleteDoc(doc(db, 'webinars', webinar.id)); setWebinars((current) => current.filter((item) => item.id !== webinar.id)); toast.success('Workshop entry deleted.'); } catch (error) { toast.error('Failed to delete workshop.'); }
    };

    return <div>
        <div className="page-header"><h2>Manage Workshop</h2></div>

        {/* Quick Title & Price Update Card */}
        <section className="admin-card mb-6" style={{ marginBottom: '24px' }}>
            <div className="webinar-editor__heading">
                <h3><Heading size={18} inline style={{ marginRight: 8 }} /> Quick Title & Price Updation Endpoint</h3>
            </div>
            <form className="admin-form" onSubmit={handleUpdateTitleAndPrice}>
                <div className="form-group-row">
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Workshop Title</label>
                        <input 
                            value={quickTitle} 
                            onChange={(e) => setQuickTitle(e.target.value)} 
                            placeholder="VKartbox Basic Graphite & Charcoal Workshop" 
                            required 
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Price (₹)</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={quickPrice} 
                            onChange={(e) => setQuickPrice(e.target.value)} 
                            placeholder="2499" 
                            required 
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button className="btn-primary" type="submit" disabled={updatingQuick}>
                        <Save size={17} /> {updatingQuick ? 'Updating...' : 'Update Title & Price Endpoint'}
                    </button>
                </div>
            </form>
        </section>

        {/* Full Workshop Manager */}
        <section className="admin-card webinar-editor">
            <div className="webinar-editor__heading">
                <h3>{editingId ? 'Edit Workshop' : 'Create Workshop Entry'}</h3>
                {editingId && <button type="button" className="btn-icon" onClick={resetForm} title="Cancel editing"><X size={18} /></button>}
            </div>
            <form className="admin-form" onSubmit={saveWebinar}>
                <div className="form-group"><label>Workshop name</label><input name="title" value={form.title} onChange={updateField} placeholder="Portrait Drawing Workshop" required /></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={updateField} rows="4" placeholder="What attendees will learn..." required /></div>
                <div className="form-group-row"><div className="form-group"><label>Date</label><input name="date" type="date" value={form.date} onChange={updateField} required /></div><div className="form-group"><label>Time</label><input name="time" type="time" value={form.time} onChange={updateField} required /></div><div className="form-group"><label>Price (₹)</label><input name="price" type="number" min="1" step="0.01" value={form.price} onChange={updateField} required /></div></div>
                <label className="webinar-published-toggle"><input name="isPublished" type="checkbox" checked={form.isPublished} onChange={updateField} /> Show this workshop on the public website</label>
                <div className="form-actions"><button className="btn-primary" type="submit" disabled={saving}><Plus size={17} /> {saving ? 'Saving...' : editingId ? 'Save Workshop' : 'Create Workshop'}</button></div>
            </form>
        </section>

        <section className="admin-card">
            {loading ? <div className="empty-state">Loading workshop entries...</div> : webinars.length === 0 ? <div className="empty-state">No custom workshop entries yet.</div> : <div className="table-container"><table className="admin-table"><thead><tr><th>Workshop</th><th>Date & time</th><th>Price</th><th>Website</th><th>Actions</th></tr></thead><tbody>{webinars.map((webinar) => <tr key={webinar.id}><td className="font-medium">{webinar.title}</td><td>{webinar.date}<br />{webinar.time}</td><td>₹{webinar.price}</td><td><span className={`status-badge ${webinar.isPublished ? 'available' : 'sold-out'}`}>{webinar.isPublished ? 'Published' : 'Hidden'}</span></td><td><button className="btn-icon" onClick={() => editWebinar(webinar)} title="Edit"><Pencil size={17} /></button><button className="btn-icon-danger" onClick={() => removeWebinar(webinar)} title="Delete"><Trash2 size={17} /></button></td></tr>)}</tbody></table></div>}
        </section>
    </div>;
}
