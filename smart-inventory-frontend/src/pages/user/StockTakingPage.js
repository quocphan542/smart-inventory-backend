import React, { useEffect, useState } from 'react';
import adjustmentService from '../../services/adjustmentService';

export const StockTakingPage = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdjustments();
  }, []);

  const loadAdjustments = async () => {
    try {
      const data = await adjustmentService.getAll();
      setAdjustments(data);
    } catch (error) {
      console.error('Error loading adjustments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="page-container">
      <h1>Kiểm kê</h1>
      <button className="btn btn-primary">+ Tạo phiếu kiểm kê</button>

      <div className="adjustments-list">
        {adjustments.length === 0 ? (
          <p>Không có phiếu kiểm kê nào!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Ngày</th>
                <th>Kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((adjustment) => (
                <tr key={adjustment.id}>
                  <td>{adjustment.adjustmentCode}</td>
                  <td>{adjustment.adjustmentDate}</td>
                  <td>{adjustment.warehouseName}</td>
                  <td>{adjustment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
