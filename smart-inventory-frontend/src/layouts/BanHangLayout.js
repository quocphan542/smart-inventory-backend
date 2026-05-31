import React from 'react';
import { Outlet } from 'react-router-dom';
// Giả sử bạn có Sidebar và Header riêng cho User
// import { BanHangSidebar } from '../components/BanHangSidebar';
// import { Header } from '../components/Header';

export const BanHangLayout = () => {
    return (
        <div className="layout">
            {/* <BanHangSidebar /> */}
            <div className="main-content">
                {/* <Header /> */}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};