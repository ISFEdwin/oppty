-- Oppty PostgreSQL schema
-- Run this once against a PostgreSQL database to set up persistent storage.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / Profiles
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    hourly_rate_net NUMERIC(10, 2) NOT NULL,
    target_utility  NUMERIC(6, 2) NOT NULL DEFAULT 2.00,
    annual_rate     NUMERIC(6, 4) NOT NULL DEFAULT 0.07,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Goals
CREATE TABLE IF NOT EXISTS goals (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    target_amount NUMERIC(12, 2) NOT NULL,
    saved_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    category      TEXT DEFAULT 'general',
    target_date   DATE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (for Utilisation Audit)
CREATE TABLE IF NOT EXISTS subscriptions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    monthly_cost  NUMERIC(10, 2) NOT NULL,
    category      TEXT DEFAULT 'entertainment',
    hours_used    NUMERIC(8, 2) NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Anti-Impulse Vault items
CREATE TABLE IF NOT EXISTS vault_items (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name        TEXT NOT NULL,
    price            NUMERIC(12, 2) NOT NULL,
    url              TEXT,
    goal_id          UUID REFERENCES goals(id),
    rationality_data JSONB,
    locked_until     TIMESTAMPTZ NOT NULL,
    decision         TEXT CHECK (decision IN ('buy', 'skip')),
    decided_at       TIMESTAMPTZ,
    added_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis history (optional – for tracking past reports)
CREATE TABLE IF NOT EXISTS analysis_history (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    item_name     TEXT,
    price         NUMERIC(12, 2) NOT NULL,
    report_data   JSONB NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
