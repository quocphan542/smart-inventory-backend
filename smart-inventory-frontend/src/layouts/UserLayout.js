import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserLayout.css';

export const UserLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="user-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Smart Inventory</h2>
          <p className="user-info">Nhân viên: {user?.username}</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <h3>Hoạt động kho</h3>
            <Link to="/user">Dashboard</Link>
          </div>

          <div className="nav-group">
            <h3>Vận hành</h3>
            <Link to="/user/inbound">Nhập kho</Link>
            <Link to="/user/outbound">Xuất kho</Link>
          </div>

          <div className="nav-group">
            <h3>Quản lý tồn kho</h3>
            <Link to="/user/stock-lookup">Tra cứu tồn kho</Link>
            <Link to="/user/stock-taking">Kiểm kê</Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
