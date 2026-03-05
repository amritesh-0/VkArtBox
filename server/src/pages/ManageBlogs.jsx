import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Trash2 } from 'lucide-react';

const ManageBlogs = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const blogsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBlogs(blogsData);
        } catch (error) {
            console.error("Error fetching blogs: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                await deleteDoc(doc(db, 'blogs', id));
                setBlogs(blogs.filter(blog => blog.id !== id));
            } catch (error) {
                console.error("Error deleting blog: ", error);
                alert("Failed to delete blog.");
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <h2>Manage Blogs</h2>
                <button className="btn-primary" onClick={() => navigate('/blogs/new')}>
                    <Plus size={18} />
                    <span>New Blog Post</span>
                </button>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div className="empty-state">Loading blogs...</div>
                ) : blogs.length === 0 ? (
                    <div className="empty-state">
                        No blogs found. Create your first post to get started!
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map(blog => (
                                    <tr key={blog.id}>
                                        <td>
                                            <img src={blog.image} alt={blog.title} className="table-img" />
                                        </td>
                                        <td className="font-medium">{blog.title}</td>
                                        <td>{blog.category}</td>
                                        <td>{blog.date}</td>
                                        <td>
                                            <button className="btn-icon-danger" onClick={() => handleDelete(blog.id)}>
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
        </div>
    );
};

export default ManageBlogs;
