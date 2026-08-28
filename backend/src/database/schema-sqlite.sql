-- ============================================================================
-- Pawn Broker Management System - SQLite Database Schema
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    aadhar_number TEXT UNIQUE,
    pan_number TEXT UNIQUE,
    created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bills table
CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    bill_date TEXT NOT NULL DEFAULT CURRENT_DATE,
    principal_amount REAL NOT NULL,
    interest_percentage REAL NOT NULL,
    interest_amount REAL NOT NULL,
    total_amount REAL NOT NULL,
    amount_in_words TEXT NOT NULL,
    bill_status TEXT NOT NULL DEFAULT 'active' CHECK (bill_status IN ('active', 'closed', 'forfeited', 'redeemed')),
    signature_image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    closed_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bill items table
CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    item_description TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('gold', 'silver', 'platinum', 'copper', 'brass', 'bronze', 'electronics', 'jewelry', 'watches', 'other')),
    weight REAL,
    current_market_value REAL NOT NULL,
    purity TEXT,
    specifications TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'interest', 'redemption', 'forfeiture')),
    amount_paid REAL NOT NULL,
    interest_months INTEGER,
    total_payable REAL,
    payment_date TEXT NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'cheque')),
    processed_by TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id),
    FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    changes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_bill_status ON bills(bill_status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_transactions_bill_id ON transactions(bill_id);
