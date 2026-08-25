import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase';

const blankWebinar = { title: '', description: '', date: '', time: '', price: '', isPublished: true };

export default function ManageWebinars() {
    const [webinars, setWebinars] = useState([]);
    const [form, setForm] = useState(blankWebinar);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadWebinars = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'webinars'));
            setWebinars(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.createdAt?.seconds || 0).localeCompare(String(a.createdAt?.seconds || 0))));
        } catch (error) {
            console.error('Error loading webinars:', error);
            toast.error('Failed to load webinars.');
        } finally { setLoading(false); }
    };

    useEffect(() => { loadWebinars(); }, []);

    const resetForm = () => { setForm(blankWebinar); setEditingId(null); };
    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

    const saveWebinar = async (event) => {
        event.preventDefault();
        const price = Number(form.price);
        if (!form.title.trim() || !form.description.trim() || !form.date.trim() || !form.time.trim() || !Number.isFinite(price) || price <= 0) {
            toast.error('Enter the webinar title, details, date, time, and a valid price.');
            return;
        }
        setSaving(true);
        const toastId = toast.loading(editingId ? 'Updating webinar...' : 'Creating webinar...');
        const payload = { title: form.title.trim(), description: form.description.trim(), date: form.date.trim(), time: form.time.trim(), price, isPublished: form.isPublished, updatedAt: serverTimestamp() };
        try {
            if (editingId) await updateDoc(doc(db, 'webinars', editingId), payload);
            else await addDoc(collection(db, 'webinars'), { ...payload, createdAt: serverTimestamp() });
            toast.success(editingId ? 'Webinar updated.' : 'Webinar created.', { id: toastId });
            resetForm();
            await loadWebinars();
        } catch (error) {
            console.error('Error saving webinar:', error);
            toast.error(error.message || 'Failed to save webinar.', { id: toastId });
        } finally { setSaving(false); }
    };

    const editWebinar = (webinar) => { setEditingId(webinar.id); setForm({ title: webinar.title || '', description: webinar.description || '', date: webinar.date || '', time: webinar.time || '', price: webinar.price || '', isPublished: Boolean(webinar.isPublished) }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const removeWebinar = async (webinar) => {
        if (!window.confirm(`Delete “${webinar.title}”? Existing registration records will be kept.`)) return;
        try { await deleteDoc(doc(db, 'webinars', webinar.id)); setWebinars((current) => current.filter((item) => item.id !== webinar.id)); toast.success('Webinar deleted.'); } catch (error) { toast.error('Failed to delete webinar.'); }
    };

    return <div>
        <div className="page-header"><h2>Manage Webinars</h2></div>
        <section className="admin-card webinar-editor">
            <div className="webinar-editor__heading"><h3>{editingId ? 'Edit webinar' : 'Create webinar'}</h3>{editingId && <button type="button" className="btn-icon" onClick={resetForm} title="Cancel editing"><X size={18} /></button>}</div>
            <form className="admin-form" onSubmit={saveWebinar}>
                <div className="form-group"><label>Webinar name</label><input name="title" value={form.title} onChange={updateField} placeholder="Painting with Watercolour" required /></div>
                <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={updateField} rows="4" placeholder="What attendees will learn..." required /></div>
                <div className="form-group-row"><div className="form-group"><label>Date</label><input name="date" value={form.date} onChange={updateField} placeholder="Saturday, 20 September 2026" required /></div><div className="form-group"><label>Time</label><input name="time" value={form.time} onChange={updateField} placeholder="4:00 PM – 5:30 PM IST" required /></div><div className="form-group"><label>Price (₹)</label><input name="price" type="number" min="1" step="0.01" value={form.price} onChange={updateField} required /></div></div>
                <label className="webinar-published-toggle"><input name="isPublished" type="checkbox" checked={form.isPublished} onChange={updateField} /> Show this webinar on the public website</label>
                <div className="form-actions"><button className="btn-primary" type="submit" disabled={saving}><Plus size={17} /> {saving ? 'Saving...' : editingId ? 'Save webinar' : 'Create webinar'}</button></div>
            </form>
        </section>
        <section className="admin-card">
            {loading ? <div className="empty-state">Loading webinars...</div> : webinars.length === 0 ? <div className="empty-state">Create your first webinar above.</div> : <div className="table-container"><table className="admin-table"><thead><tr><th>Webinar</th><th>Date & time</th><th>Price</th><th>Website</th><th>Actions</th></tr></thead><tbody>{webinars.map((webinar) => <tr key={webinar.id}><td className="font-medium">{webinar.title}</td><td>{webinar.date}<br />{webinar.time}</td><td>₹{webinar.price}</td><td><span className={`status-badge ${webinar.isPublished ? 'available' : 'sold-out'}`}>{webinar.isPublished ? 'Published' : 'Hidden'}</span></td><td><button className="btn-icon" onClick={() => editWebinar(webinar)} title="Edit"><Pencil size={17} /></button><button className="btn-icon-danger" onClick={() => removeWebinar(webinar)} title="Delete"><Trash2 size={17} /></button></td></tr>)}</tbody></table></div>}
        </section>
    </div>;
}
