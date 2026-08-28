-- ============================================================================
-- Pawn Broker Management System - Database Schema
-- ============================================================================
-- This schema defines the complete database structure for the pawn broker
-- management system including users, customers, bills, items, transactions,
-- and audit logging.
-- ============================================================================

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    theme_preference VARCHAR(20) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- TABLE: customers
-- ============================================================================
CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    aadhar_number VARCHAR(12) UNIQUE,
    pan_number VARCHAR(10) UNIQUE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_aadhar ON customers(aadhar_number);
CREATE INDEX idx_customers_pan ON customers(pan_number);
CREATE INDEX idx_customers_created_by ON customers(created_by);

-- ============================================================================
-- TABLE: bills
-- ============================================================================
CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
    principal_amount DECIMAL(12, 2) NOT NULL CHECK (principal_amount >= 0),
    interest_percentage DECIMAL(5, 2) NOT NULL CHECK (interest_percentage >= 0),
    interest_amount DECIMAL(12, 2) NOT NULL CHECK (interest_amount >= 0),
    total_amount DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    amount_in_words TEXT NOT NULL,
    bill_status VARCHAR(20) NOT NULL DEFAULT 'active' 
        CHECK (bill_status IN ('active', 'closed', 'forfeited', 'redeemed')),
    signature_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME
);

CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_customer_id ON bills(customer_id);
CREATE INDEX idx_bills_created_by ON bills(created_by);
CREATE INDEX idx_bills_bill_date ON bills(bill_date);
CREATE INDEX idx_bills_bill_status ON bills(bill_status);
CREATE INDEX idx_bills_closed_at ON bills(closed_at);
CREATE INDEX idx_bills_created_at ON bills(created_at);

CREATE INDEX idx_bills_customer_status ON bills(customer_id, bill_status);
CREATE INDEX idx_bills_status_date ON bills(bill_status, bill_date);
CREATE INDEX idx_bills_customer_date ON bills(customer_id, bill_date);

-- ============================================================================
-- TABLE: bill_items
-- ============================================================================
CREATE TABLE bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other')),
    weight DECIMAL(10, 3) CHECK (weight >= 0),
    current_market_value DECIMAL(12, 2) NOT NULL CHECK (current_market_value >= 0),
    purity VARCHAR(20),
    specifications TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_items_item_type ON bill_items(item_type);

-- ============================================================================
-- TABLE: transactions
-- ============================================================================
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('payment', 'interest', 'redemption', 'forfeiture')),
    amount_paid DECIMAL(12, 2) NOT NULL CHECK (amount_paid >= 0),
    interest_months INTEGER CHECK (interest_months >= 0),
    total_payable DECIMAL(12, 2) CHECK (total_payable >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'cheque')),
    processed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_bill_id ON transactions(bill_id);
CREATE INDEX idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_payment_date ON transactions(payment_date);
CREATE INDEX idx_transactions_processed_by ON transactions(processed_by);

-- ============================================================================
-- TABLE: audit_log
-- ============================================================================
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    changes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================
CREATE VIEW active_bills_view AS
SELECT 
    b.id,
    b.bill_number,
    b.bill_date,
    b.principal_amount,
    b.interest_percentage,
    b.interest_amount,
    b.total_amount,
    b.bill_status,
    c.name AS customer_name,
    c.phone AS customer_phone,
    u.full_name AS created_by_name
FROM bills b
JOIN customers c ON b.customer_id = c.id
JOIN users u ON b.created_by = u.id
WHERE b.bill_status = 'active';

CREATE VIEW bill_transaction_summary AS
SELECT 
    b.id AS bill_id,
    b.bill_number,
    b.total_amount,
    COALESCE(SUM(t.amount_paid), 0) AS total_paid,
    b.total_amount - COALESCE(SUM(t.amount_paid), 0) AS remaining_balance,
    COUNT(t.id) AS transaction_count
FROM bills b
LEFT JOIN transactions t ON b.id = t.bill_id
GROUP BY b.id, b.bill_number, b.total_amount;
