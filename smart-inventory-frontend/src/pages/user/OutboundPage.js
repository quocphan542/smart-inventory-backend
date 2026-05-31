import React, { useEffect, useState } from 'react';
import issueService from '../../services/issueService';

export const OutboundPage = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await issueService.getAll();
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="page-container">
      <h1>Xuất kho</h1>
      <button className="btn btn-primary">+ Tạo phiếu xuất</button>

      <div className="issues-list">
        {issues.length === 0 ? (
          <p>Không có phiếu xuất nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Ngày</th>
                <th>Khách hàng</th>
                <th>Kho</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.issueCode}</td>
                  <td>{issue.issueDate}</td>
                  <td>{issue.customerName}</td>
                  <td>{issue.warehouseName}</td>
                  <td>{issue.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
