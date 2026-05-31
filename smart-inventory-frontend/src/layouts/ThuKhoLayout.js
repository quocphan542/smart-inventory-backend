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
    LogOut,
    HardDrive,
    ChevronDown,
    Factory,
    Box,
    GitBranch,
    Package,
    Truck,
    Users2
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
                    <button className="user-menu-trigger">
                        <ChevronDown size={16} />
                    </button>
                </div>

                <nav className="sidebar-nav-section">
                    <NavItem to="/thukho" icon={<LayoutDashboard size={18} />}>
                        Bảng Điều Khiển
                    </NavItem>
                    
                    {/* --- Nhóm 1: Hệ thống (Read Only) --- */}
                    <p className="nav-group-label">HỆ THỐNG (XEM)</p>
                    <NavItem to="/thukho/warehouses" icon={<Factory size={18} />}>
                        Kho Bãi
                    </NavItem>
                    <NavItem to="/thukho/units" icon={<Box size={18} />}>
                        Đơn Vị Tính
                    </NavItem>
                    <NavItem to="/thukho/categories" icon={<GitBranch size={18} />}>
                        Danh Mục
                    </NavItem>

                    {/* --- Nhóm 2: Master Data (Read Only) --- */}
                    <p className="nav-group-label">DỮ LIỆU NGUỒN</p>
                    <NavItem to="/thukho/products" icon={<Package size={18} />}>
                        Sản Phẩm
                    </NavItem>
                    
                    {/* --- Nhóm 3: Đối tác (Read Only) --- */}
                    <p className="nav-group-label">ĐỐI TÁC</p>
                    <NavItem to="/thukho/suppliers" icon={<Truck size={18} />}>
                        Nhà Cung Cấp
                    </NavItem>
                    {/* Tạm thời ẩn Khách hàng nếu chưa có trang CustomerPage */}
                    {/* <NavItem to="/thukho/customers" icon={<Users2 size={18} />}>
                        Khách Hàng
                    </NavItem> */}

                    {/* --- Nhóm 4: Tác vụ Kho (Full Access) --- */}
                    <p className="nav-group-label">TÁC VỤ KHO</p>
                    <NavItem to="/thukho/inbound" icon={<FileDown size={18} />}>
                        Nhập Kho
                    </NavItem>
                    <NavItem to="/thukho/outbound" icon={<FileUp size={18} />}>
                        Xuất Kho
                    </NavItem>
                    <NavItem to="/thukho/stock-taking" icon={<ArrowLeftRight size={18} />}>
                        Kiểm Kê
                    </NavItem>
                    <NavItem to="/thukho/stock-lookup" icon={<Search size={18} />}>
                        Tra Cứu Tồn Kho
                    </NavItem>
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