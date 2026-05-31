import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/AdminLayout.css'; // Tái sử dụng style của Admin
import {
    LayoutDashboard,
    FileDown,
    FileUp,
    ArrowLeftRight,
    Search,
    LogOut
} from 'lucide-react';

const NavItem = ({ to, icon, children }) => (
    <NavLink to={to} className="nav-item" end>
        {icon}
        <span>{children}</span>
    </NavLink>
);

export const ThuKhoLayout = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="admin-layout-container">
            <aside className="sidebar-chassis">
                <div className="sidebar-header-plate">
                    <h2 className="system-name-stamp">OPERATIONS DECK</h2>
                </div>

                <div className="user-display-module">
                    <div className="avatar-well">
                        <span>{user?.username?.charAt(0).toUpperCase() || 'T'}</span>
                    </div>
                    <div className="user-info-panel">
                        <span className="user-name-label">{user?.username || 'Operator'}</span>
                        <span className="user-role-tag">{t('menu.role_thukho')}</span>
                    </div>
                </div>

                <nav className="sidebar-nav-section">
                    <NavItem to="/thukho" icon={<LayoutDashboard size={20} />}>
                        {t('menu.dashboard')}
                    </NavItem>
                    <NavItem to="/thukho/inbound" icon={<FileDown size={20} />}>
                        {t('thukho.menu_inbound')}
                    </NavItem>
                    <NavItem to="/thukho/outbound" icon={<FileUp size={20} />}>
                        {t('thukho.menu_outbound')}
                    </NavItem>
                    <NavItem to="/thukho/stock-taking" icon={<ArrowLeftRight size={20} />}>
                        {t('thukho.menu_stock_taking')}
                    </NavItem>
                    <NavItem to="/thukho/stock-lookup" icon={<Search size={20} />}>
                        {t('thukho.menu_stock_lookup')}
                    </NavItem>
                </nav>

                <div className="sidebar-footer-plate">
                    <button onClick={logout} className="logout-trigger-button">
                        <LogOut size={20} />
                        <span>{t('menu.logout')}</span>
                    </button>
                </div>
            </aside>

            <main className="main-content-chassis">
                <Outlet />
            </main>
        </div>
    );
};