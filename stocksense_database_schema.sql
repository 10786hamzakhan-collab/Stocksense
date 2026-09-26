-- StockSense Inventory Management System
-- MySQL 8.0+
-- Database + schema for the hackathon problem statement

CREATE DATABASE IF NOT EXISTS stocksense;
USE stocksense;

-- =========================
-- 1. USERS / AUTHENTICATION
-- =========================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('INVENTORY_MANAGER','WAREHOUSE_STAFF','ADMIN') NOT NULL DEFAULT 'WAREHOUSE_STAFF',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. PRODUCT MASTER DATA
-- =========================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE units (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_name VARCHAR(50) NOT NULL UNIQUE,
    abbreviation VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(80) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    unit_id INT NOT NULL,
    initial_stock DECIMAL(14,3) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(14,3) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id),

    CONSTRAINT fk_product_unit
        FOREIGN KEY (unit_id) REFERENCES units(unit_id),

    CONSTRAINT chk_product_stock CHECK (initial_stock >= 0),
    CONSTRAINT chk_product_reorder CHECK (reorder_level >= 0)
);

-- =========================
-- 3. WAREHOUSES / LOCATIONS
-- =========================
CREATE TABLE warehouses (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_name VARCHAR(120) NOT NULL UNIQUE,
    address VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id INT NOT NULL,
    location_name VARCHAR(120) NOT NULL,
    location_type ENUM('WAREHOUSE','RACK','PRODUCTION','OTHER')
        NOT NULL DEFAULT 'RACK',
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_location_warehouse
        FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),

    CONSTRAINT uq_location_per_warehouse
        UNIQUE (warehouse_id, location_name)
);

-- Current stock of every product at every location
CREATE TABLE stock (
    stock_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_stock_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT fk_stock_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id),

    CONSTRAINT uq_product_location
        UNIQUE (product_id, location_id),

    CONSTRAINT chk_stock_quantity CHECK (quantity >= 0)
);

-- =========================
-- 4. SUPPLIERS
-- =========================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 5. RECEIPTS / INCOMING STOCK
-- =========================
CREATE TABLE receipts (
    receipt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_no VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    status ENUM('DRAFT','WAITING','READY','DONE','CANCELED')
        NOT NULL DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP NULL,

    CONSTRAINT fk_receipt_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),

    CONSTRAINT fk_receipt_location
        FOREIGN KEY (destination_location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_receipt_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE receipt_items (
    receipt_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(14,3) NOT NULL,

    CONSTRAINT fk_receipt_item_receipt
        FOREIGN KEY (receipt_id) REFERENCES receipts(receipt_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_receipt_item_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT chk_receipt_quantity CHECK (quantity > 0)
);

-- =========================
-- 6. DELIVERY ORDERS / OUTGOING STOCK
-- =========================
CREATE TABLE deliveries (
    delivery_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_no VARCHAR(50) NOT NULL UNIQUE,
    source_location_id INT NOT NULL,
    customer_name VARCHAR(150),
    status ENUM('DRAFT','WAITING','READY','DONE','CANCELED')
        NOT NULL DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP NULL,

    CONSTRAINT fk_delivery_source
        FOREIGN KEY (source_location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_delivery_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE delivery_items (
    delivery_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(14,3) NOT NULL,

    CONSTRAINT fk_delivery_item_delivery
        FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_delivery_item_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT chk_delivery_quantity CHECK (quantity > 0)
);

-- =========================
-- 7. INTERNAL TRANSFERS
-- =========================
CREATE TABLE transfers (
    transfer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_no VARCHAR(50) NOT NULL UNIQUE,
    source_location_id INT NOT NULL,
    destination_location_id INT NOT NULL,
    status ENUM('DRAFT','WAITING','READY','DONE','CANCELED')
        NOT NULL DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    CONSTRAINT fk_transfer_source
        FOREIGN KEY (source_location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_transfer_destination
        FOREIGN KEY (destination_location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_transfer_user
        FOREIGN KEY (created_by) REFERENCES users(user_id),

    CONSTRAINT chk_transfer_locations
        CHECK (source_location_id <> destination_location_id)
);

CREATE TABLE transfer_items (
    transfer_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    quantity DECIMAL(14,3) NOT NULL,

    CONSTRAINT fk_transfer_item_transfer
        FOREIGN KEY (transfer_id) REFERENCES transfers(transfer_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transfer_item_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT chk_transfer_quantity CHECK (quantity > 0)
);

-- =========================
-- 8. STOCK ADJUSTMENTS
-- =========================
CREATE TABLE adjustments (
    adjustment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    adjustment_no VARCHAR(50) NOT NULL UNIQUE,
    location_id INT NOT NULL,
    reason VARCHAR(255),
    status ENUM('DRAFT','DONE','CANCELED') NOT NULL DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_at TIMESTAMP NULL,

    CONSTRAINT fk_adjustment_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_adjustment_user
        FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE adjustment_items (
    adjustment_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    adjustment_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    recorded_quantity DECIMAL(14,3) NOT NULL,
    counted_quantity DECIMAL(14,3) NOT NULL,
    difference DECIMAL(14,3)
        GENERATED ALWAYS AS (counted_quantity - recorded_quantity) STORED,

    CONSTRAINT fk_adjustment_item_adjustment
        FOREIGN KEY (adjustment_id) REFERENCES adjustments(adjustment_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_adjustment_item_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT chk_adjustment_recorded CHECK (recorded_quantity >= 0),
    CONSTRAINT chk_adjustment_counted CHECK (counted_quantity >= 0)
);

-- =========================
-- 9. STOCK LEDGER / MOVEMENT HISTORY
-- =========================
CREATE TABLE stock_ledger (
    ledger_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    movement_type ENUM(
        'RECEIPT',
        'DELIVERY',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'ADJUSTMENT'
    ) NOT NULL,
    quantity_change DECIMAL(14,3) NOT NULL,
    reference_type VARCHAR(30),
    reference_id BIGINT,
    notes VARCHAR(255),
    performed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ledger_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT fk_ledger_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id),

    CONSTRAINT fk_ledger_user
        FOREIGN KEY (performed_by) REFERENCES users(user_id)
);

-- =========================
-- 10. REORDER RULES
-- =========================
CREATE TABLE reorder_rules (
    reorder_rule_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    minimum_quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
    reorder_quantity DECIMAL(14,3) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_reorder_product
        FOREIGN KEY (product_id) REFERENCES products(product_id),

    CONSTRAINT fk_reorder_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id),

    CONSTRAINT uq_reorder_product_location
        UNIQUE (product_id, location_id),

    CONSTRAINT chk_minimum_quantity CHECK (minimum_quantity >= 0),
    CONSTRAINT chk_reorder_quantity CHECK (reorder_quantity > 0)
);

-- =========================
-- 11. USEFUL INDEXES
-- =========================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_stock_product ON stock(product_id);
CREATE INDEX idx_stock_location ON stock(location_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_ledger_product_date ON stock_ledger(product_id, created_at);
CREATE INDEX idx_ledger_location_date ON stock_ledger(location_id, created_at);

-- =========================
-- 12. DASHBOARD VIEW
-- =========================
CREATE VIEW inventory_summary AS
SELECT
    p.product_id,
    p.product_name,
    p.sku,
    c.category_name,
    COALESCE(SUM(s.quantity), 0) AS total_stock,
    p.reorder_level,
    CASE
        WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 'OUT_OF_STOCK'
        WHEN COALESCE(SUM(s.quantity), 0) <= p.reorder_level THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN stock s ON p.product_id = s.product_id
GROUP BY
    p.product_id,
    p.product_name,
    p.sku,
    c.category_name,
    p.reorder_level;

-- =========================
-- 13. BASIC SAMPLE MASTER DATA
-- =========================
INSERT INTO units (unit_name, abbreviation) VALUES
('Piece', 'pcs'),
('Kilogram', 'kg'),
('Liter', 'L');

INSERT INTO categories (category_name, description) VALUES
('Raw Material', 'Materials used in production'),
('Finished Goods', 'Completed products'),
('Consumables', 'General consumable inventory');

INSERT INTO warehouses (warehouse_name, address) VALUES
('Main Warehouse', 'Main Store');

INSERT INTO locations (warehouse_id, location_name, location_type)
VALUES
(1, 'Main Store', 'WAREHOUSE'),
(1, 'Production Rack', 'PRODUCTION'),
(1, 'Rack A', 'RACK'),
(1, 'Rack B', 'RACK');

-- Example product
INSERT INTO products
(product_name, sku, category_id, unit_id, initial_stock, reorder_level)
VALUES
('Steel Rods', 'STL-001', 1, 2, 0, 20);
