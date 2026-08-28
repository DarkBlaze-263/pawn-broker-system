# Database Schema Documentation

## Overview

This directory contains the complete PostgreSQL database schema for the Pawn Broker Management System.

## Files

- `schema.sql` - Complete database schema with tables, indexes, views, and functions
- `init-db.js` - Node.js script to initialize the database with the schema

## Database Tables

### 1. users
Stores system user accounts for authentication and authorization.

**Columns:**
- `id` (UUID, Primary Key) - Unique user identifier
- `username` (VARCHAR(50), Unique) - Login username
- `email` (VARCHAR(255), Unique) - User email address
- `password_hash` (VARCHAR(255)) - Bcrypt hashed password
- `full_name` (VARCHAR(100)) - User's full name
- `phone` (VARCHAR(20)) - Contact phone number
- `theme_preference` (VARCHAR(20)) - UI theme preference (light/dark)
- `is_active` (BOOLEAN) - Account status
- `created_at` (TIMESTAMP) - Account creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

**Indexes:** username, email, is_active

### 2. customers
Stores customer information for pawn shop clients.

**Columns:**
- `id` (UUID, Primary Key) - Unique customer identifier
- `name` (VARCHAR(100)) - Customer name
- `address` (TEXT) - Customer address
- `phone` (VARCHAR(20)) - Contact phone number
- `email` (VARCHAR(255)) - Email address
- `aadhar_number` (VARCHAR(12), Unique) - Aadhar card number (12 digits)
- `pan_number` (VARCHAR(10), Unique) - PAN card number (format: ABCDE1234F)
- `created_by` (UUID, Foreign Key) - User who created the record
- `created_at` (TIMESTAMP) - Record creation timestamp

**Indexes:** name, phone, email, aadhar_number, pan_number, created_by

**Constraints:**
- Aadhar must be exactly 12 digits
- PAN must match format: 5 letters + 4 digits + 1 letter

### 3. bills
Stores pawn loan bills and their status.

**Columns:**
- `id` (UUID, Primary Key) - Unique bill identifier
- `bill_number` (VARCHAR(20), Unique) - Auto-generated bill number
- `customer_id` (UUID, Foreign Key) - Associated customer
- `created_by` (UUID, Foreign Key) - User who created the bill
- `bill_date` (DATE) - Bill creation date
- `principal_amount` (DECIMAL(12,2)) - Loan principal amount
- `interest_percentage` (DECIMAL(5,2)) - Interest rate percentage
- `interest_amount` (DECIMAL(12,2)) - Calculated interest amount
- `total_amount` (DECIMAL(12,2)) - Total payable amount
- `amount_in_words` (TEXT) - Amount in words for documentation
- `bill_status` (VARCHAR(20)) - Bill status (active/closed/forfeited/redeemed)
- `signature_image` (TEXT) - Base64 encoded signature image
- `created_at` (TIMESTAMP) - Bill creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `closed_at` (TIMESTAMP) - Bill closure timestamp

**Indexes:** bill_number, customer_id, created_by, bill_date, bill_status, closed_at

**Constraints:**
- All monetary fields must be >= 0
- Bill status must be one of: active, closed, forfeited, redeemed

### 4. bill_items
Stores individual items pawned under each bill.

**Columns:**
- `id` (UUID, Primary Key) - Unique item identifier
- `bill_id` (UUID, Foreign Key) - Associated bill
- `item_description` (TEXT) - Detailed item description
- `item_type` (VARCHAR(50)) - Item category (gold/silver/electronics/jewelry/watches/other)
- `weight` (DECIMAL(10,3)) - Item weight in grams
- `current_market_value` (DECIMAL(12,2)) - Current market value
- `purity` (VARCHAR(20)) - Purity percentage (e.g., "22", "18", "916")
- `specifications` (TEXT) - Additional specifications
- `created_at` (TIMESTAMP) - Record creation timestamp

**Indexes:** bill_id, item_type

**Constraints:**
- Item type must be one of: gold, silver, electronics, jewelry, watches, other
- Weight and value must be >= 0

### 5. transactions
Stores payment transactions for bills.

**Columns:**
- `id` (UUID, Primary Key) - Unique transaction identifier
- `bill_id` (UUID, Foreign Key) - Associated bill
- `transaction_type` (VARCHAR(20)) - Type (payment/interest/redemption/forfeiture)
- `amount_paid` (DECIMAL(12,2)) - Amount paid
- `interest_months` (INTEGER) - Number of interest months covered
- `total_payable` (DECIMAL(12,2)) - Total payable amount
- `payment_date` (DATE) - Payment date
- `payment_method` (VARCHAR(20)) - Payment method (cash/card/upi/bank_transfer/cheque)
- `processed_by` (UUID, Foreign Key) - User who processed the transaction
- `created_at` (TIMESTAMP) - Transaction creation timestamp

**Indexes:** bill_id, transaction_type, payment_date, processed_by

**Constraints:**
- Transaction type must be one of: payment, interest, redemption, forfeiture
- Payment method must be one of: cash, card, upi, bank_transfer, cheque

### 6. audit_log
Stores audit trail for all database changes.

**Columns:**
- `id` (UUID, Primary Key) - Unique log entry identifier
- `user_id` (UUID, Foreign Key) - User who made the change
- `action` (VARCHAR(20)) - Action type (INSERT/UPDATE/DELETE)
- `table_name` (VARCHAR(50)) - Table affected
- `record_id` (UUID) - ID of the affected record
- `changes` (JSONB) - Detailed changes in JSON format
- `created_at` (TIMESTAMP) - Log creation timestamp

**Indexes:** user_id, action, table_name, record_id, created_at

## Database Views

### active_bills_view
Shows all active bills with customer and user information.

**Columns:** bill details + customer_name, customer_phone, created_by_name

### bill_transaction_summary
Shows payment summary for each bill.

**Columns:** bill_id, bill_number, total_amount, total_paid, remaining_balance, transaction_count

## Database Functions

### generate_bill_number()
Generates unique bill numbers in format: YYYYMM + 6-digit sequence

Example: 202401000001, 202401000002, etc.

## Automatic Triggers

### update_updated_at_column
Automatically updates the `updated_at` timestamp on rows when they are modified.
Applied to: users, bills tables

## Usage

### Initialize Database

1. Ensure PostgreSQL is running and DATABASE_URL is set in `.env`
2. Run the initialization script:
```bash
npm run init-db
```

Or directly:
```bash
node src/database/init-db.js
```

### Manual Schema Execution

You can also execute the schema directly using psql:
```bash
psql -U username -d database_name -f src/database/schema.sql
```

## Validation Rules

### Aadhar Number Validation
- Must be exactly 12 digits
- Format: `^[0-9]{12}$`

### PAN Number Validation
- Must match pattern: 5 letters + 4 digits + 1 letter
- Format: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`

### Purity Validation
- Must be numeric (can include decimal)
- Format: `^[0-9]+(\.[0-9]+)?$`

### Status/Type Constraints
- All status and type fields use CHECK constraints to ensure valid values
- Invalid values will be rejected by the database

## Performance Considerations

### Indexes
All frequently queried columns have indexes for optimal performance:
- Foreign key columns
- Unique columns
- Date columns
- Status/type columns

### UUID vs Auto-increment
- UUIDs are used for primary keys to support distributed systems
- UUIDs prevent ID enumeration attacks
- UUIDs allow offline record creation

### JSONB for Audit Log
- The `changes` column uses JSONB for efficient storage and querying
- JSONB supports indexing and querying within JSON data

## Security Considerations

1. **Password Storage**: Passwords are never stored in plain text. Use bcrypt to hash passwords before storing.

2. **Foreign Key Constraints**: 
   - RESTRICT on critical relationships (bills, transactions)
   - SET NULL on optional relationships (audit_log user_id)

3. **Cascade Delete**: 
   - bill_items uses CASCADE to delete items when a bill is deleted
   - Other tables use RESTRICT to prevent accidental data loss

4. **Audit Trail**: All changes should be logged to the audit_log table for compliance and debugging.

## Backup and Restore

### Backup
```bash
pg_dump -U username -d database_name > backup.sql
```

### Restore
```bash
psql -U username -d database_name < backup.sql
```

## Migration Notes

When modifying the schema:
1. Create a new migration file
2. Use ALTER TABLE statements for changes
3. Update this documentation
4. Test changes in development first
5. Back up production database before applying
