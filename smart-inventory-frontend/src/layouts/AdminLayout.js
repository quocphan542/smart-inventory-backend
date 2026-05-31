import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import '../styles/AdminLayout.css';
import {
    LayoutDashboard, HardDrive, Package, Users, Factory, Truck, LogOut, ChevronDown,
    Box, Users2, GitBranch, ArrowLeftRight, FileUp, FileDown, BrainCircuit, Archive, Globe
} from 'lucide-react';

const NavItem = ({ to, icon, children }) => (
    <NavLink to={to} className="nav-item" end>
        {icon}
        <span>{children}</span>
    </NavLink>
);

export const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { language, toggleLanguage, t } = useLanguage();

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
                        <span>{user?.username?.charAt(0).toUpperCase() || 'A'}</span>
                    </div>
                    <div className="user-info-panel">
                        <span className="user-name-label">{user?.username || 'admin_user'}</span>
                        <span className="user-role-tag">{t('menu.role_admin')}</span>
                    </div>
                    <button className="user-menu-trigger">
                        <ChevronDown size={16} />
                    </button>
                </div>

                <nav className="sidebar-nav-section">
                    <NavItem to="/admin" icon={<LayoutDashboard size={18} />}>{t('menu.dashboard')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.system_setup')}</p>
                    <NavItem to="/admin/warehouses" icon={<Factory size={18} />}>{t('menu.warehouses')}</NavItem>
                    <NavItem to="/admin/units" icon={<Box size={18} />}>{t('menu.units')}</NavItem>
                    <NavItem to="/admin/categories" icon={<GitBranch size={18} />}>{t('menu.categories')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.master_data')}</p>
                    <NavItem to="/admin/products" icon={<Package size={18} />}>{t('menu.products')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.partners')}</p>
                    <NavItem to="/admin/suppliers" icon={<Truck size={18} />}>{t('menu.suppliers')}</NavItem>
                    <NavItem to="/admin/customers" icon={<Users2 size={18} />}>{t('menu.customers')}</NavItem>
                    
                    <p className="nav-group-label">{t('menu.operations')}</p>
                    <NavItem to="/admin/receipts" icon={<FileDown size={18} />}>{t('menu.receipts')}</NavItem>
                    <NavItem to="/admin/issues" icon={<FileUp size={18} />}>{t('menu.issues')}</NavItem>
                    <NavItem to="/admin/adjustments" icon={<ArrowLeftRight size={18} />}>{t('menu.adjustments')}</NavItem>
                    <NavItem to="/admin/inventory-stocks" icon={<Archive size={18} />}>{t('menu.inventory_stocks')}</NavItem>

                    <p className="nav-group-label">{t('menu.analytics')}</p>
                    <NavItem to="/admin/ai-demand-forecast" icon={<BrainCircuit size={18} />}>{t('menu.forecast')}</NavItem>

                    <p className="nav-group-label">{t('menu.administration')}</p>
                    <NavItem to="/admin/users" icon={<Users size={18} />}>{t('menu.users')}</NavItem>
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