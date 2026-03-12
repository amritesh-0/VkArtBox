import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(isEditMode);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [categoryOptions, setCategoryOptions] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        author: '',
        publication: '',
        category: '',
        lead: '',
        background: '',
        analysis: '',
        artworkDescription: '',
        quotes: '',
        conclusion: '',
        tags: '',
        content: '',
    });

    useEffect(() => {
        const fetchFormDependencies = async () => {
            try {
                const categoriesSnapshot = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
                const categories = [...new Set(
                    categoriesSnapshot.docs
                        .map((blogDoc) => blogDoc.data().category)
                        .filter(Boolean)
                )];
                setCategoryOptions(categories);

                if (!isEditMode) {
                    return;
                }

                const blogSnapshot = await getDoc(doc(db, 'blogs', id));
                if (!blogSnapshot.exists()) {
                    toast.error('Blog post not found.');
                    navigate('/blogs');
                    return;
                }

                const blogData = blogSnapshot.data();
                setFormData({
                    title: blogData.title || '',
                    subtitle: blogData.subtitle || '',
                    author: blogData.author || '',
                    publication: blogData.publication || '',
                    category: blogData.category || '',
                    lead: blogData.lead || '',
                    background: blogData.background || '',
                    analysis: blogData.analysis || '',
                    artworkDescription: blogData.artworkDescription || '',
                    quotes: Array.isArray(blogData.quotes) ? blogData.quotes.join('\n') : '',
                    conclusion: blogData.conclusion || '',
                    tags: Array.isArray(blogData.tags) ? blogData.tags.join(', ') : '',
                    content: blogData.content || '',
                });
                setImagePreview(blogData.image || null);
            } catch (error) {
                console.error('Error fetching blog form dependencies: ', error);
                toast.error(isEditMode ? 'Failed to load blog post.' : 'Failed to load blog categories.');
                if (isEditMode) {
                    navigate('/blogs');
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

        // Validation check
        if (!formData.title.trim()) {
            toast.error("Please provide a title.");
            return;
        }
        if (!imageFile && !imagePreview) {
            toast.error("Please select a cover image.");
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(isEditMode ? 'Updating blog post...' : 'Publishing blog post...');

        try {
            let imageUrl = imagePreview;
            if (imageFile) {
                const imageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
                await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(imageRef);
            }

            const blogData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                quotes: formData.quotes.split('\n').map(q => q.trim()).filter(q => q !== ''),
                image: imageUrl,
                updatedAt: serverTimestamp(),
            };

            if (isEditMode) {
                await updateDoc(doc(db, 'blogs', id), blogData);
                toast.success('Blog post updated successfully!', { id: loadingToast });
            } else {
                await addDoc(collection(db, 'blogs'), {
                    ...blogData,
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    createdAt: serverTimestamp(),
                    comments: []
                });
                toast.success('Blog post created successfully!', { id: loadingToast });
            }

            setTimeout(() => navigate('/blogs'), 1000);
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} blog: `, error);
            toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'publish'} blog post.`, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    if (loadingInitialData) {
        return (
            <div className="form-page">
                <div className="admin-card">
                    <div className="empty-state">Loading blog post...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-icon" onClick={() => navigate('/blogs')}>
                        <ArrowLeft size={24} />
                    </button>
                    <h2>{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                </div>
            </div>

            <div className="admin-card">
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. The Evolution of Pencil Portraits" />
                    </div>

                    <div className="form-group">
                        <label>Subtitle</label>
                        <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="e.g. From Graphite Deposits to Masterful Expressions" />
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Author Name</label>
                            <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="e.g. Julian Vane" />
                        </div>
                        <div className="form-group">
                            <label>Publication Name (Optional)</label>
                            <input type="text" name="publication" value={formData.publication} onChange={handleChange} placeholder="e.g. Art Journal Monthly" />
                        </div>
                    </div>

                    <div className="form-group-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                list="blog-category-options"
                                placeholder="e.g. Art History"
                            />
                            <datalist id="blog-category-options">
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category} />
                                ))}
                            </datalist>
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="#graphite, #history" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Introduction (Lead)</label>
                        <textarea name="lead" value={formData.lead} onChange={handleChange} rows="3" placeholder="A compelling opening paragraph..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Background / Context</label>
                        <textarea name="background" value={formData.background} onChange={handleChange} rows="4" placeholder="Historical context or setup..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Main Analysis</label>
                        <textarea name="analysis" value={formData.analysis} onChange={handleChange} rows="6" placeholder="The core content and deep dive..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Artwork Description</label>
                        <textarea name="artworkDescription" value={formData.artworkDescription} onChange={handleChange} rows="4" placeholder="Detailing the specific artwork..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Quotes (One per line)</label>
                        <textarea name="quotes" value={formData.quotes} onChange={handleChange} rows="3" placeholder="Key insights or quotes..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Conclusion</label>
                        <textarea name="conclusion" value={formData.conclusion} onChange={handleChange} rows="4" placeholder="Closing thoughts and summary..."></textarea>
                    </div>

                    <div className="form-group">
                        <label>Cover Image {isEditMode ? '' : '*'}</label>
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

                    <div className="form-group">
                        <label>Legacy Content / HTML Fallback (Optional)</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows="6" placeholder="Only use if structured fields are not sufficient..."></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => navigate('/blogs')}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Save size={18} />
                            <span>{loading ? 'Saving...' : isEditMode ? 'Update Blog Post' : 'Publish Blog Post'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlogForm;
