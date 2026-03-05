import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="admin-layout">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: 'var(--admin-bg-secondary)',
                    color: 'var(--admin-text-primary)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.9rem',
                    border: '1px solid var(--admin-border)'
                }
            }} />
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {isSidebarOpen && <button className="sidebar-overlay" onClick={closeSidebar} aria-label="Close sidebar" />}
            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={openSidebar} aria-label="Open sidebar menu">
                            <Menu size={20} />
                        </button>
                        <h1 className="topbar-title">Welcome Admin</h1>
                    </div>
                    <div className="admin-avatar">A</div>
                </div>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
