import React, { useEffect, useState, useCallback } from 'react';
import inventoryStockService from '../../services/inventoryStockService';

export const StockLookupPage = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ warehouseId: '', productId: '' });

  const loadStocks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryStockService.getAll(filters);
      setStocks(data);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="page-container">
      <h1>Tra cứu tồn kho</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Lọc theo kho"
          value={filters.warehouseId}
          onChange={(e) =>
            setFilters({ ...filters, warehouseId: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Lọc theo sản phẩm"
          value={filters.productId}
          onChange={(e) =>
            setFilters({ ...filters, productId: e.target.value })
          }
        />
      </div>

      <div className="stocks-list">
        {stocks.length === 0 ? (
          <p>Không có tồn kho nào</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Kho</th>
                <th>Vị trí</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Lô</th>
                <th>Hạn dùng</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.warehouseName}</td>
                  <td>{stock.locationName}</td>
                  <td>{stock.productName}</td>
                  <td>{stock.quantity}</td>
                  <td>{stock.batchNumber}</td>
                  <td>{stock.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
