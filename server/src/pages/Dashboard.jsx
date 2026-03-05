import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        blogs: 0,
        artworks: 0,
        collections: 3
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const blogsSnapshot = await getCountFromServer(collection(db, 'blogs'));
                const artSnapshot = await getCountFromServer(collection(db, 'artworks'));

                setStats({
                    blogs: blogsSnapshot.data().count,
                    artworks: artSnapshot.data().count,
                    collections: 3 // Static for now, based on defined collections
                });
            } catch (error) {
                console.error("Error fetching stats: ", error);
                toast.error("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard Overview</h2>
            </div>

            {loading ? (
                <div className="empty-state">Loading statistics...</div>
            ) : (
                <div className="dashboard-stats">
                    <Link to="/blogs" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3 className="stat-title">Total Logs Published</h3>
                            <p className="stat-value">{stats.blogs}</p>
                        </div>
                    </Link>
                    <Link to="/collections" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3 className="stat-title">Total Artworks</h3>
                            <p className="stat-value">{stats.artworks}</p>
                        </div>
                    </Link>
                    <Link to="/collections" style={{ textDecoration: 'none' }}>
                        <div className="stat-card">
                            <h3 className="stat-title">Active Collections</h3>
                            <p className="stat-value">{stats.collections}</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
