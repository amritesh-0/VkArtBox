import { NavLink } from 'react-router-dom';
import { BriefcaseBusiness, FileText, Image as ImageIcon, LayoutDashboard, LogOut, Mail, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthProvider';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully.');
            onClose();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to log out.');
        }
    };

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
                <NavLink to="/applications" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <BriefcaseBusiness size={20} />
                    <span>Applications</span>
                </NavLink>
                <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <Mail size={20} />
                    <span>Contact Messages</span>
                </NavLink>
                <div className="nav-divider"></div>
                <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={onClose}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
