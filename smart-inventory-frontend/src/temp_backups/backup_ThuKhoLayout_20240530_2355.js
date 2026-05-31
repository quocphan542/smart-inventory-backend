import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/AdminLayout.css'; // Tái sử dụng style của AdminLayout
import {
    LayoutDashboard, HardDrive, Package, Truck, LogOut, ChevronDown,
    Box, Users2, ArrowLeftRight, FileUp, FileDown, Archive
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
                    <div className="logo-well">
                        <HardDrive size={28} className="logo-icon" />
                    </div>
                    <h2 className="system-name-stamp">SMART INVENTORY</h2>
                </div>

                <div className="user-display-module">
                    <div className="avatar-well">
                        <span>{user?.username?.charAt(0).toUpperCase() || 'T'}</span>
                    </div>
                    <div className="user-info-panel">
                        <span className="user-name-label">{user?.username || 'user'}</span>
                        <span className="user-role-tag">{t('menu.role_thukho')}</span>
                    </div>
                    <button className="user-menu-trigger">
                        <ChevronDown size={16} />
                    </button>
                </div>

                <nav className="sidebar-nav-section">
                    <NavItem to="/thukho" icon={<LayoutDashboard size={18} />}>{t('menu.dashboard')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.master_data')}</p>
                    <NavItem to="/thukho/products" icon={<Package size={18} />}>{t('menu.products')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.partners')}</p>
                    <NavItem to="/thukho/suppliers" icon={<Truck size={18} />}>{t('menu.suppliers')}</NavItem>
                    <NavItem to="/thukho/customers" icon={<Users2 size={18} />}>{t('menu.customers')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.operations')}</p>
                    <NavItem to="/thukho/receipts" icon={<FileDown size={18} />}>{t('menu.receipts')}</NavItem>
                    <NavItem to="/thukho/issues" icon={<FileUp size={18} />}>{t('menu.issues')}</NavItem>
                    <NavItem to="/thukho/adjustments" icon={<ArrowLeftRight size={18} />}>{t('menu.adjustments')}</NavItem>
                    <NavItem to="/thukho/inventory-stocks" icon={<Archive size={18} />}>{t('menu.inventory_stocks')}</NavItem>
                </nav>

                <div className="sidebar-footer-plate">
                    <button onClick={logout} className="logout-trigger-button">
                        <LogOut size={18} />
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