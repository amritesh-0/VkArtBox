import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageCollections = () => {
    const navigate = useNavigate();
    const [artworks, setArtworks] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchArtworks();
    }, []);

    const fetchArtworks = async () => {
        try {
            const [artworksSnapshot, collectionsSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'artworks'), orderBy('createdAt', 'desc'))),
                getDocs(collection(db, 'collections')),
            ]);
            const data = artworksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const collectionData = collectionsSnapshot.docs
                .map(collectionDoc => ({
                    id: collectionDoc.id,
                    ...collectionDoc.data(),
                }))
                .sort((a, b) => String(a.number || '').localeCompare(String(b.number || ''), undefined, { numeric: true }));
            setArtworks(data);
            setCollections(collectionData);
        } catch (error) {
            console.error("Error fetching artworks: ", error);
            toast.error("Failed to load artworks.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this artwork?')) {
            const toastId = toast.loading('Deleting artwork...');
            try {
                await deleteDoc(doc(db, 'artworks', id));
                setArtworks(artworks.filter(art => art.id !== id));
                toast.success('Artwork deleted successfully', { id: toastId });
            } catch (error) {
                console.error("Error deleting artwork: ", error);
                toast.error("Failed to delete artwork.", { id: toastId });
            }
        }
    };

    const filteredArtworks = filter === 'all'
        ? artworks
        : artworks.filter(a => a.collectionId === filter);
    const collectionLabels = collections.reduce((acc, item) => {
        acc[item.id] = item.title || item.id;
        return acc;
    }, {});

    return (
        <div>
            <div className="page-header">
                <h2>Manage Collections</h2>
                <button className="btn-primary" onClick={() => navigate('/collections/new')}>
                    <Plus size={18} />
                    <span>Add Artwork</span>
                </button>
            </div>

            <div className="filters-bar">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="admin-select">
                    <option value="all">All Collections</option>
                    {collections.map((item) => (
                        <option key={item.id} value={item.id}>{item.title || item.id}</option>
                    ))}
                </select>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div className="empty-state">Loading artworks...</div>
                ) : filteredArtworks.length === 0 ? (
                    <div className="empty-state">
                        No artworks found in this collection.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Collection</th>
                                    <th>Status</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArtworks.map(art => (
                                    <tr key={art.id}>
                                        <td>
                                            <img src={art.image} alt={art.title} className="table-img" />
                                        </td>
                                        <td className="font-medium">{art.title}</td>
                                        <td>{collectionLabels[art.collectionId] || art.collectionId}</td>
                                        <td>
                                            <span className={`status-badge ${art.status.replace(/ /g, '-').toLowerCase()}`}>
                                                {art.status}
                                            </span>
                                        </td>
                                        <td>{art.price || '-'}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => navigate(`/collections/${art.id}/edit`)}>
                                                <Pencil size={18} />
                                            </button>
                                            <button className="btn-icon-danger" onClick={() => handleDelete(art.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ManageCollections;
