import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Image as ImageIcon, LogOut, Settings, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <h2>VKArtBox Admin</h2>
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar menu">
                    <X size={20} />
                </button>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} end onClick={onClose}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/blogs" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <FileText size={20} />
                    <span>Manage Blogs</span>
                </NavLink>
                <NavLink to="/collections" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <ImageIcon size={20} />
                    <span>Manage Collections</span>
                </NavLink>
                <div className="nav-divider"></div>
                <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
