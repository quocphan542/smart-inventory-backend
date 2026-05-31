import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './guards/ProtectedRoute';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { ThuKhoLayout } from './layouts/ThuKhoLayout';
import { BanHangLayout } from './layouts/BanHangLayout';

// Pages
import LoginPage from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ProductList } from './pages/admin/ProductList';
import UserManagementPage from './pages/admin/UserManagementPage';
import WarehouseManagementPage from './pages/admin/WarehouseManagementPage';
import UnitConversionConsole from './pages/admin/UnitConversionConsole';
import CategoryConsole from './pages/admin/CategoryConsole';
import SupplierConsole from './pages/admin/SupplierConsole';
import CustomerConsole from './pages/admin/CustomerConsole';
import InboundReceiptConsole from './pages/admin/InboundReceiptConsole';
import OutboundIssueConsole from './pages/admin/OutboundIssueConsole';
import InventoryLocatorConsole from './pages/admin/InventoryLocatorConsole';
import InventoryAuditConsole from './pages/admin/InventoryAuditConsole';
import AiForecastConsole from './pages/admin/AiForecastConsole';
import { ThuKhoDashboard } from './pages/thukho/ThuKhoDashboard';
import { BanHangDashboard } from './pages/banhang/BanHangDashboard';

// 404 Page
const NotFoundPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>404 - Trang không tìm thấy</h1>
    <p>Trang bạn tìm kiếm không tồn tại.</p>
  </div>
);

// Unauthorized Page
const UnauthorizedPage = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>403 - Truy cập bị từ chối</h1>
    <p>Bạn không có quyền truy cập trang này.</p>
  </div>
);

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="warehouses" element={<WarehouseManagementPage />} />
              <Route path="units" element={<UnitConversionConsole />} />
              <Route path="categories" element={<CategoryConsole />} />
              <Route path="suppliers" element={<SupplierConsole />} />
              <Route path="customers" element={<CustomerConsole />} />
              <Route path="receipts" element={<InboundReceiptConsole />} />
              <Route path="issues" element={<OutboundIssueConsole />} />
              <Route path="inventory-stocks" element={<InventoryLocatorConsole />} />
              <Route path="adjustments" element={<InventoryAuditConsole />} />
              <Route path="ai-demand-forecast" element={<AiForecastConsole />} />
            </Route>

            {/* Thủ kho Routes */}
            <Route
              path="/thukho"
              element={
                <ProtectedRoute requiredRole="Thủ kho">
                  <ThuKhoLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ThuKhoDashboard />} />
              {/* Thêm các trang khác của Thủ kho ở đây */}
            </Route>

            {/* Bán hàng (User) Routes */}
            <Route
              path="/banhang"
              element={
                <ProtectedRoute requiredRole="User">
                  <BanHangLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BanHangDashboard />} />
              {/* Thêm các trang khác của User ở đây */}
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;