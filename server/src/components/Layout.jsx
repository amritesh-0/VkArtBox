import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from './AuthProvider';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();

    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);
    const adminLabel = useMemo(() => user?.email || 'Admin', [user]);
    const adminInitial = useMemo(() => (user?.email?.[0] || 'A').toUpperCase(), [user]);

    return (
        <div className="admin-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {isSidebarOpen && <button className="sidebar-overlay" onClick={closeSidebar} aria-label="Close sidebar" />}
            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn" onClick={openSidebar} aria-label="Open sidebar menu">
                            <Menu size={20} />
                        </button>
                        <h1 className="topbar-title">Welcome {adminLabel}</h1>
                    </div>
                    <div className="admin-avatar">{adminInitial}</div>
                </div>
                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
