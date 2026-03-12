import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ArtworkForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [collections, setCollections] = useState([]);

    const [formData, setFormData] = useState({
        collectionId: '',
        title: '',
        medium: '',
        dimensions: '',
        year: new Date().getFullYear().toString(),
        description: '',
        status: 'Available',
        price: '',
    });

    useEffect(() => {
        const fetchFormDependencies = async () => {
            try {
                const collectionsSnapshot = await getDocs(collection(db, 'collections'));
                const collectionOptions = collectionsSnapshot.docs
                    .map((collectionDoc) => ({
                        id: collectionDoc.id,
                        ...collectionDoc.data(),
                    }))
                    .sort((a, b) => String(a.number || '').localeCompare(String(b.number || ''), undefined, { numeric: true }));
                setCollections(collectionOptions);

                if (!isEditMode) {
                    setFormData((prev) => ({
                        ...prev,
                        collectionId: prev.collectionId || collectionOptions[0]?.id || '',
                    }));
                    return;
                }

                const artworkSnapshot = await getDoc(doc(db, 'artworks', id));
                if (!artworkSnapshot.exists()) {
                    toast.error('Artwork not found.');
                    navigate('/collections');
                    return;
                }

                const artworkData = artworkSnapshot.data();
                setFormData({
                    collectionId: artworkData.collectionId || collectionOptions[0]?.id || '',
                    title: artworkData.title || '',
                    medium: artworkData.medium || '',
                    dimensions: artworkData.dimensions || '',
                    year: artworkData.year || new Date().getFullYear().toString(),
                    description: artworkData.description || '',
                    status: artworkData.status || 'Available',
                    price: artworkData.price || '',
                });
                setImagePreview(artworkData.image || null);
            } catch (error) {
                console.error('Error fetching artwork form dependencies: ', error);
                toast.error(isEditMode ? 'Failed to load artwork.' : 'Failed to load collections.');
                if (isEditMode) {
                    navigate('/collections');
                }
            } finally {
                setLoadingInitialData(false);
            }
        };

        fetchFormDependencies();
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("Please provide an artwork title.");
            return;
        }
        if (!formData.collectionId) {
            toast.error("Please select a collection.");
            return;
        }
        if (!imageFile && !imagePreview) {
            toast.error("Please select an artwork image.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(isEditMode ? 'Updating artwork...' : 'Saving artwork...');

        try {
            let imageUrl = imagePreview;
            if (imageFile) {
                const imageRef = ref(storage, `artworks/${formData.collectionId}/${Date.now()}_${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const artworkData = {
                ...formData,
                image: imageUrl,
                price: formData.price.trim() === '' ? null : formData.price,
                updatedAt: serverTimestamp(),
            };

            if (isEditMode) {
                await updateDoc(doc(db, 'artworks', id), artworkData);
                toast.success('Artwork updated successfully!', { id: loadingToast });
            } else {
                await addDoc(collection(db, 'artworks'), {
                    ...artworkData,
                    createdAt: serverTimestamp(),
                });
                toast.success('Artwork added successfully!', { id: loadingToast });
            }

            setTimeout(() => navigate('/collections'), 1000);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} artwork: `, error);
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} artwork.`, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (loadingInitialData) {
        return (
            <div className="form-page">
                <div className="admin-card">
                    <div className="empty-state">Loading artwork...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate('/collections')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>{isEditMode ? 'Edit Artwork' : 'Add New Artwork'}</h2>
                </div>
            </div>

            <div className="admin-card">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Collection *</label>
                            <select name="collectionId" value={formData.collectionId} onChange={handleChange} required>
                                <option value="">Select a collection</option>
                                {collections.map((item) => (
                                    <option key={item.id} value={item.id}>{item.title || item.id}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Artwork Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Keerthy Suresh" />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Medium</label>
                            <input type="text" name="medium" value={formData.medium} onChange={handleChange} placeholder="e.g. Graphite & Charcoal on Paper" />
                        </div>
                        <div className="form-group">
                            <label>Dimensions</label>
                            <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="e.g. A3 (11.7 x 16.5 inches)" />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Year</label>
                            <input type="text" name="year" value={formData.year} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Available">Available</option>
                                <option value="Sold">Sold</option>
                                <option value="Available as Print">Available as Print</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Price (Include currency symbol, leave blank if sold)</label>
                        <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. ₹12,000" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Detail the artwork..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Artwork Image {isEditMode ? '' : '*'}</label>
                        <div className="image-upload-wrapper">
                            {imagePreview ? (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="remove-image-btn">Remove</button>
                                </div>
                            ) : (
                                <div className="image-upload-box">
                                    <ImageIcon size={48} className="upload-icon" />
                                    <p>Click to upload or drag and drop</p>
                                    <input type="file" accept="image/*" onChange={handleImageChange} required={!isEditMode} className="file-input-hidden" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/collections')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} />
                            <span>{loading ? 'Saving...' : isEditMode ? 'Update Artwork' : 'Save Artwork'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtworkForm;
