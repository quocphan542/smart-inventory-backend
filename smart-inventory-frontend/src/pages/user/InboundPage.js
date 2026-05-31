import React, { useEffect, useState } from 'react';
import receiptService from '../../services/receiptService';

export const InboundPage = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const data = await receiptService.getAll();
      setReceipts(data);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="page-container">
      <h1>Nhập kho</h1>
      <button className="btn btn-primary">+ Tạo phiếu nhập</button>

      <div className="receipts-list">
        {receipts.length === 0 ? (
          <p>Không có phiếu nhập nào!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Ngày</th>
                <th>Nhà cung cấp</th>
                <th>Kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td>{receipt.receiptCode}</td>
                  <td>{receipt.receiptDate}</td>
                  <td>{receipt.supplierName}</td>
                  <td>{receipt.warehouseName}</td>
                  <td>{receipt.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
