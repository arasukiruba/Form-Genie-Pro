-- ============================================
-- Form Genie — Supabase Database Schema
-- ============================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- bcrypt hashed
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  plan TEXT CHECK (plan IN ('starter', 'pro', 'executive')),
  credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL UNIQUE,
  screenshot_url TEXT,
  plan TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Credit Logs Table
CREATE TABLE IF NOT EXISTS credit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credits_added INTEGER DEFAULT 0,
  credits_deducted INTEGER DEFAULT 0,
  action_by TEXT NOT NULL, -- 'system', 'admin', or admin user id
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_logs_user_id ON credit_logs(user_id);

-- 5. Admin user seeding
-- Admin credentials are stored as environment variables (ADMIN_USERNAME, ADMIN_PASSWORD_HASH)
-- and seeded automatically at server startup via server/src/utils/seedAdmin.ts
-- Do NOT hardcode credentials here.

-- 6. Storage Buckets (run via Supabase Dashboard or API)
-- CREATE BUCKET 'payment-screenshots' (public: false)
-- CREATE BUCKET 'static-assets' (public: true)

-- 7. RLS Policies (basic — disable RLS for server-side service role usage)
-- ─── Announcements Table ────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent')),
    active boolean DEFAULT true,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active, created_at DESC);

-- ─── Row Level Security ─────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so backend access works fine.
-- For direct client access (if needed), add policies:
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can read all users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND role = 'admin')
  );
