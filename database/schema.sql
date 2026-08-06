-- ============================================================================
-- FinTrack - Database Schema
-- PostgreSQL 15.x
-- Created: August 2026
-- ============================================================================

-- Create ENUM types
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "AccountTypeName" AS ENUM ('CASH', 'BANK', 'CREDIT_CARD', 'E_WALLET', 'INVESTMENT', 'OTHER');
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');
CREATE TYPE "NotificationFrequency" AS ENUM ('REALTIME', 'DAILY', 'WEEKLY', 'NEVER');
CREATE TYPE "NotificationType" AS ENUM ('TRANSACTION', 'BUDGET_ALERT', 'GOAL_ACHIEVEMENT', 'RECURRING_REMINDER', 'SYSTEM');

-- ============================================================================
-- USER TABLES
-- ============================================================================

-- Users table
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role "Role" DEFAULT 'USER' NOT NULL,
    email_verified BOOLEAN DEFAULT false NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP(3),
    deleted_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL
);

-- User Settings table
CREATE TABLE "user_settings" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR' NOT NULL,
    language VARCHAR(10) DEFAULT 'id' NOT NULL,
    time_zone VARCHAR(50) DEFAULT 'Asia/Jakarta' NOT NULL,
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY' NOT NULL,
    theme VARCHAR(20) DEFAULT 'light' NOT NULL,
    decimal_places INTEGER DEFAULT 2 NOT NULL,
    budget_notification "NotificationFrequency" DEFAULT 'WEEKLY' NOT NULL,
    transaction_notification BOOLEAN DEFAULT true NOT NULL,
    goal_notification BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- ============================================================================
-- ACCOUNT TABLES
-- ============================================================================

-- Account Types
CREATE TABLE "account_types" (
    id SERIAL PRIMARY KEY,
    name "AccountTypeName" UNIQUE NOT NULL
);

-- Accounts
CREATE TABLE "accounts" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_type_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    balance DECIMAL(19, 4) DEFAULT 0 NOT NULL,
    currency VARCHAR(10) DEFAULT 'IDR' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_reconciled TIMESTAMP(3),
    last_balance DECIMAL(19, 4),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (account_type_id) REFERENCES "account_types"(id) ON DELETE RESTRICT
);

-- ============================================================================
-- CATEGORY TABLE
-- ============================================================================

CREATE TABLE "categories" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    type "TransactionType" NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_system BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE (user_id, name, type)
);

-- ============================================================================
-- TRANSACTION TABLE
-- ============================================================================

CREATE TABLE "transactions" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER,
    to_account_id INTEGER,
    type "TransactionType" NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    description TEXT,
    transaction_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes TEXT,
    tags TEXT[],
    receipt_url VARCHAR(255),
    recurring_id INTEGER,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES "accounts"(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES "categories"(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES "accounts"(id) ON DELETE SET NULL
);

-- ============================================================================
-- BUDGET TABLES
-- ============================================================================

-- Budgets
CREATE TABLE "budgets" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alert_threshold INTEGER DEFAULT 80,
    notes TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES "categories"(id) ON DELETE CASCADE
);

-- Budget Alerts
CREATE TABLE "budget_alerts" (
    id SERIAL PRIMARY KEY,
    budget_id INTEGER NOT NULL,
    alert_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    spending_amount DECIMAL(19, 4) NOT NULL,
    percentage INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    FOREIGN KEY (budget_id) REFERENCES "budgets"(id) ON DELETE CASCADE
);

-- ============================================================================
-- GOAL TABLES
-- ============================================================================

-- Goals
CREATE TABLE "goals" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_amount DECIMAL(19, 4) NOT NULL,
    current_amount DECIMAL(19, 4) DEFAULT 0 NOT NULL,
    start_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    target_date TIMESTAMP(3) NOT NULL,
    category VARCHAR(50),
    priority INTEGER DEFAULT 1,
    is_achieved BOOLEAN DEFAULT false NOT NULL,
    achieved_at TIMESTAMP(3),
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Goal Transactions
CREATE TABLE "goal_transactions" (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL,
    transaction_id INTEGER NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    transaction_date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (goal_id) REFERENCES "goals"(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES "transactions"(id) ON DELETE CASCADE
);

-- ============================================================================
-- RECURRING TRANSACTIONS
-- ============================================================================

CREATE TABLE "recurrings" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER,
    type "TransactionType" NOT NULL,
    amount DECIMAL(19, 4) NOT NULL,
    description TEXT,
    frequency "RecurringFrequency" NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    last_executed TIMESTAMP(3),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP(3) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES "accounts"(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES "categories"(id) ON DELETE SET NULL
);

-- ============================================================================
-- NOTIFICATION TABLE
-- ============================================================================

CREATE TABLE "notifications" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type "NotificationType" NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    read_at TIMESTAMP(3),
    metadata JSONB,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================

CREATE TABLE "activity_logs" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);

-- Account indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type_id);

-- Transaction indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- Budget indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_period ON budgets(period_start, period_end);

-- Goal indexes
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_target_date ON goals(target_date);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE "User" IS 'User accounts and authentication';
COMMENT ON TABLE "user_settings" IS 'User preferences and settings';
COMMENT ON TABLE "accounts" IS 'Financial accounts (bank, cash, credit cards, etc.)';
COMMENT ON TABLE "categories" IS 'Transaction categories for income and expenses';
COMMENT ON TABLE "transactions" IS 'Financial transactions (income, expense, transfer)';
COMMENT ON TABLE "budgets" IS 'Monthly budgets by category';
COMMENT ON TABLE "goals" IS 'Financial goals and savings targets';
COMMENT ON TABLE "recurrings" IS 'Recurring transactions (subscriptions, salary, etc.)';
COMMENT ON TABLE "notifications" IS 'User notifications';
COMMENT ON TABLE "activity_logs" IS 'Audit logs for user actions';

-- ============================================================================
-- INITIAL DATA (Account Types)
-- ============================================================================

INSERT INTO account_types (name) VALUES 
    ('CASH'),
    ('BANK'),
    ('CREDIT_CARD'),
    ('E_WALLET'),
    ('INVESTMENT'),
    ('OTHER');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
