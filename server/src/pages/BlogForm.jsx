import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        tags: '',
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

        // Validation check
        if (!formData.title.trim()) {
            toast.error("Please provide a title.");
            return;
        }
        if (!formData.content.trim()) {
            toast.error("Blog content cannot be empty.");
            return;
        }
        if (!imageFile) {
            toast.error("Please select a cover image.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Publishing blog post...');

        try {
            // 1. Upload image
            const imageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
            await uploadBytes(imageRef, imageFile);
            const imageUrl = await getDownloadURL(imageRef);

            // 2. Save info to Firestore
            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                image: imageUrl,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                createdAt: serverTimestamp(),
                comments: []
            };

            await addDoc(collection(db, 'blogs'), blogData);

            toast.success('Blog post created successfully!', { id: loadingToast });
            setTimeout(() => navigate('/blogs'), 1000);
        } catch (error) {
            console.error("Error adding blog: ", error);
            toast.error(error.message || "Failed to publish blog post.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate('/blogs')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>Create New Blog Post</h2>
                </div>
            </div>

            <div className="admin-card">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. The Evolution of Pencil Portraits" />
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Art History" />
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="#graphite, #history" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Excerpt (Short Description)</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows="3" placeholder="A short summary of the blog post..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Content (HTML supported) *</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows="12" required placeholder="<h3>Main Heading</h3><p>Your content here...</p>"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Cover Image *</label>
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
                        <button type="button" className="btn-secondary" onClick={() => navigate('/blogs')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} />
                            <span>{loading ? 'Saving...' : 'Publish Blog Post'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;
