-- 1. KHỞI TẠO VÀ SỬ DỤNG DATABASE
create database SmartInventoryDB;
Go
USE SmartInventoryDB;
GO

-- ==========================================
-- PHÂN VÙNG 1: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (RBAC)
-- ==========================================

CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255)
);

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role_id INT,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ==========================================
-- PHÂN VÙNG 2: THÔNG TIN ĐỐI TÁC (PARTNERS)
-- ==========================================

CREATE TABLE suppliers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    supplier_name NVARCHAR(255) NOT NULL,
    tax_code VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    address NVARCHAR(500),
    lead_time_days INT DEFAULT 0,          -- Thời gian giao hàng trung bình (AI dùng)
    reliability_score DECIMAL(3,2) DEFAULT 5.00, -- Điểm uy tín từ 1 -> 5 (AI dùng)
    is_active BIT DEFAULT 1
);

CREATE TABLE customers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    customer_name NVARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address NVARCHAR(500),
    is_active BIT DEFAULT 1
);

-- ==========================================
-- PHÂN VÙNG 3: SẢN PHẨM & QUY ĐỔI ĐƠN VỊ (PRODUCTS)
-- ==========================================

CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255),
    is_active BIT DEFAULT 1
);

CREATE TABLE units (
    id INT IDENTITY(1,1) PRIMARY KEY,
    unit_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255)
);

CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,          -- Mã vạch / Mã quản lý sản phẩm
    product_name NVARCHAR(200) NOT NULL,
    image_url VARCHAR(500),                   -- Đường dẫn ảnh (phục vụ AI nhận diện)
    minimum_stock INT DEFAULT 0,              -- Ngưỡng báo động hết hàng
    category_id INT,
    base_unit_id INT,                         -- Đơn vị lưu kho nhỏ nhất (Ví dụ: Cái/Lon)
    created_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (base_unit_id) REFERENCES units(id)
);

-- Bảng xử lý logic quy đổi (Ví dụ: 1 Thùng = 24 Lon)
CREATE TABLE unit_conversions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT,
    from_unit_id INT,     -- Đơn vị lớn (Thùng)
    to_unit_id INT,       -- Đơn vị nhỏ (Lon)
    factor DECIMAL(10,2) NOT NULL, -- Tỷ lệ quy đổi (24.00)
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (from_unit_id) REFERENCES units(id),
    FOREIGN KEY (to_unit_id) REFERENCES units(id)
);

-- ==========================================
-- PHÂN VÙNG 4: KHO BÃI & VỊ TRÍ VẬT LÝ (STORAGE)
-- ==========================================

CREATE TABLE warehouses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_name NVARCHAR(100) NOT NULL,
    address NVARCHAR(500),
    is_active BIT DEFAULT 1
);

CREATE TABLE warehouse_locations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT,
    zone_code VARCHAR(20) NOT NULL,  -- Khu A, Khu B
    shelf_code VARCHAR(20) NOT NULL, -- Kệ 01, Kệ 02
    bin_code VARCHAR(20) NOT NULL,   -- Ô 101, Ô 102
    description NVARCHAR(255),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Bảng quản lý tồn kho thực tế theo thời gian thực (Real-time Stock)
CREATE TABLE inventory_stocks (
    product_id INT,
    location_id INT,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    batch_number VARCHAR(50),        -- Quản lý theo lô hàng
    expiry_date DATE,                -- Hạn sử dụng (AI quét để cảnh báo hàng cận date)
    last_updated DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (product_id, location_id, batch_number), -- Khóa chính tổ hợp
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES warehouse_locations(id)
);

-- ==========================================
-- PHÂN VÙNG 5: GIAO DỊCH & LOGIC NHẬP XUẤT (TRANSACTIONS)
-- ==========================================

-- ĐƠN NHẬP KHO (RECEIPT)
CREATE TABLE inventory_receipts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    receipt_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT,
    warehouse_id INT,
    created_by INT,
    received_date DATETIME DEFAULT GETDATE(),
    note NVARCHAR(500),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE receipt_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    receipt_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_id INT,             -- Đơn vị lúc nhập (có thể là Thùng hoặc Cái)
    price DECIMAL(18,2) NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    FOREIGN KEY (receipt_id) REFERENCES inventory_receipts(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

-- ĐƠN XUẤT KHO (ISSUE)
CREATE TABLE inventory_issues (
    id INT IDENTITY(1,1) PRIMARY KEY,
    issue_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT,
    warehouse_id INT,
    created_by INT,
    issued_date DATETIME DEFAULT GETDATE(),
    note NVARCHAR(500),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE issue_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    issue_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_id INT,
    price DECIMAL(18,2) NOT NULL,
    batch_number VARCHAR(50),
    FOREIGN KEY (issue_id) REFERENCES inventory_issues(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

-- ĐƠN KIỂM KÊ / ĐIỀU CHỈNH KHO (ADJUSTMENT)
CREATE TABLE inventory_adjustments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    adjustment_code VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT,
    created_by INT,
    adjusted_date DATETIME DEFAULT GETDATE(),
    reason NVARCHAR(500),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE adjustment_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    adjustment_id INT,
    product_id INT,
    system_qty INT,          -- Số lượng hệ thống đang ghi nhận
    actual_qty INT,          -- Số lượng nhân viên đếm thực tế
    diff_qty AS (actual_qty - system_qty), -- Cột tự động tính toán độ chênh lệch
    FOREIGN KEY (adjustment_id) REFERENCES inventory_adjustments(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- BẢNG NHẬT KÝ BIẾN ĐỘNG (AUDIT TRAIL)
CREATE TABLE inventory_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    product_id INT,
    warehouse_id INT,
    transaction_type VARCHAR(20), -- 'INBOUND', 'OUTBOUND', 'ADJUST'
    reference_code VARCHAR(50),   -- Lưu mã phiếu liên quan để đối chiếu
    quantity INT NOT NULL,        -- Số lượng thay đổi (Ví dụ: +10 hoặc -5)
    logged_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- ==========================================
-- PHÂN VÙNG 6: DỮ LIỆU AI & DỰ BÁO (AI & PREDICTIONS)
-- ==========================================

CREATE TABLE ai_demand_forecasts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT,
    forecast_date DATE NOT NULL,
    predicted_demand INT NOT NULL,          -- Số lượng AI dự báo sẽ tiêu thụ
    confidence_interval DECIMAL(5,2),       -- Độ tự tin của AI (%)
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
GO

USE SmartInventoryDB;
GO

INSERT INTO roles (role_name, description) 
VALUES (N'Admin', N'Quản trị viên toàn quyền hệ thống');
