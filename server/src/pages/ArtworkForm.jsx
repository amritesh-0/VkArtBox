import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ArtworkForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        collectionId: 'portraits',
        title: '',
        medium: '',
        dimensions: '',
        year: new Date().getFullYear().toString(),
        description: '',
        status: 'Available',
        price: '',
    });

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
        if (!imageFile) {
            toast.error("Please select an artwork image.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Saving artwork...');

        try {
            // 1. Upload image
            const imageRef = ref(storage, `artworks/${formData.collectionId}/${Date.now()}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            // 2. Save info to Firestore under artworks collection
            const artworkData = {
                ...formData,
                image: imageUrl,
                price: formData.price.trim() === '' ? null : formData.price,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'artworks'), artworkData);

            toast.success('Artwork added successfully!', { id: loadingToast });
            setTimeout(() => navigate('/collections'), 1000);
        } catch (error) {
            console.error("Error adding artwork: ", error);
            toast.error(error.message || "Failed to add artwork.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate('/collections')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>Add New Artwork</h2>
                </div>
            </div>

            <div className="admin-card">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Collection *</label>
                            <select name="collectionId" value={formData.collectionId} onChange={handleChange} required>
                                <option value="portraits">Portraits</option>
                                <option value="wildlife">Wildlife</option>
                                <option value="prints">Prints</option>
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
                        <label>Artwork Image *</label>
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
                                    <input type="file" accept="image/*" onChange={handleImageChange} required className="file-input-hidden" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/collections')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} />
                            <span>{loading ? 'Saving...' : 'Save Artwork'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtworkForm;
