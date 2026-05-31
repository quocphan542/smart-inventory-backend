import React from 'react';

export const UserDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Bảng điều khiển - Nhân viên kho</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2>Công việc hôm nay</h2>
          <p>Nhập/Xuất kho</p>
        </div>
        <div className="card">
          <h2>Tồn kho</h2>
          <p>Theo dõi tồn kho</p>
        </div>
      </div>
    </div>
  );
};
