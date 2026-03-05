import React from 'react';

const Dashboard = () => {
    return (
        <div>
            <div className="page-header">
                <h2>Dashboard Overview</h2>
            </div>
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3 className="stat-title">Total Logs Published</h3>
                    <p className="stat-value">0</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-title">Total Artworks</h3>
                    <p className="stat-value">0</p>
                </div>
                <div className="stat-card">
                    <h3 className="stat-title">Total Collections</h3>
                    <p className="stat-value">3</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
