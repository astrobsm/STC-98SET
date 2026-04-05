-- ============================================================
-- STOBA 98 Platform - Supabase PostgreSQL Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'exco', 'member');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE notification_type AS ENUM ('reminder', 'payment', 'meeting');
CREATE TYPE event_type AS ENUM ('meeting', 'announcement');

-- ============================================================
-- USERS TABLE
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  state_of_residence VARCHAR(100),
  date_of_birth DATE,
  wedding_anniversary DATE,
  role user_role DEFAULT 'member' NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
  total_due NUMERIC(12, 2) DEFAULT 10000.00 NOT NULL,
  payment_proof_url TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER,
  status payment_status DEFAULT 'pending' NOT NULL,
  admin_note TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS TABLE
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  type event_type DEFAULT 'meeting' NOT NULL,
  location TEXT,
  meeting_link TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONSTITUTION TABLE
-- ============================================================

CREATE TABLE constitution (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_number INTEGER,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONSTITUTION AMENDMENTS TABLE
-- ============================================================

CREATE TYPE amendment_status AS ENUM ('proposed', 'approved', 'rejected');

CREATE TABLE constitution_amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES constitution(id) ON DELETE CASCADE,
  proposed_text TEXT NOT NULL,
  reason TEXT,
  proposed_by UUID REFERENCES users(id),
  status amendment_status DEFAULT 'proposed' NOT NULL,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  voted_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXCO MEMBERS TABLE
-- ============================================================

CREATE TABLE exco_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  contact VARCHAR(100),
  photo_url TEXT,
  tenure_start DATE,
  tenure_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'reminder' NOT NULL,
  read_status BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTRIBUTIONS TABLE (Admin-created tracked campaigns)
-- ============================================================

CREATE TYPE contribution_status AS ENUM ('active', 'closed');

CREATE TABLE contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  deadline DATE,
  status contribution_status DEFAULT 'active' NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contribution_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
  payment_date DATE DEFAULT CURRENT_DATE,
  payment_proof_url TEXT,
  status payment_status DEFAULT 'pending' NOT NULL,
  admin_note TEXT,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contribution_id, user_id, created_at)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_year ON payments(year);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_status ON notifications(read_status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE constitution ENABLE ROW LEVEL SECURITY;
ALTER TABLE exco_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins and exco can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('admin', 'exco')
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins and exco can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('admin', 'exco')
    )
  );

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Events policies (viewable by all authenticated)
CREATE POLICY "Authenticated users can view events"
  ON events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and exco can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role IN ('admin', 'exco')
    )
  );

-- Constitution policies (viewable by all authenticated)
CREATE POLICY "Authenticated users can view constitution"
  ON constitution FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage constitution"
  ON constitution FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Exco members policies (viewable by all authenticated)
CREATE POLICY "Authenticated users can view exco members"
  ON exco_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage exco members"
  ON exco_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_constitution_updated_at
  BEFORE UPDATE ON constitution
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exco_members_updated_at
  BEFORE UPDATE ON exco_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user payment summary
CREATE OR REPLACE FUNCTION get_payment_summary(p_user_id UUID, p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER)
RETURNS TABLE (
  total_paid NUMERIC,
  total_due NUMERIC,
  outstanding NUMERIC,
  payment_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(p.amount_paid) FILTER (WHERE p.status = 'verified'), 0) AS total_paid,
    10000.00 AS total_due,
    10000.00 - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.status = 'verified'), 0) AS outstanding,
    COUNT(p.id)::INTEGER AS payment_count
  FROM payments p
  WHERE p.user_id = p_user_id AND p.year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get financial overview (admin/exco)
CREATE OR REPLACE FUNCTION get_financial_overview(p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER)
RETURNS TABLE (
  total_members BIGINT,
  total_collected NUMERIC,
  total_expected NUMERIC,
  total_outstanding NUMERIC,
  verified_payments BIGINT,
  pending_payments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = true) AS total_members,
    COALESCE(SUM(p.amount_paid) FILTER (WHERE p.status = 'verified'), 0) AS total_collected,
    (SELECT COUNT(*) FROM users WHERE is_active = true) * 10000.00 AS total_expected,
    (SELECT COUNT(*) FROM users WHERE is_active = true) * 10000.00
      - COALESCE(SUM(p.amount_paid) FILTER (WHERE p.status = 'verified'), 0) AS total_outstanding,
    COUNT(*) FILTER (WHERE p.status = 'verified') AS verified_payments,
    COUNT(*) FILTER (WHERE p.status = 'pending') AS pending_payments
  FROM payments p
  WHERE p.year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false);

-- Storage policies
CREATE POLICY "Users can upload payment proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view own payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can view all payment proofs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-proofs'
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- ============================================================
-- SEED DATA (Optional - Remove in production)
-- ============================================================

-- Insert sample constitution
INSERT INTO constitution (title, content, is_active) VALUES
('STOBA 98 Constitution', '# STOBA 98 Old Boys Association Constitution

## Article 1: Name
The name of this association shall be STOBA 98 Old Boys Association.

## Article 2: Objectives
1. To promote unity and brotherhood among members
2. To support members in their personal and professional endeavors
3. To give back to our alma mater
4. To organize social and networking events

## Article 3: Membership
Membership is open to all former students of the 1998 graduating set.

## Article 4: Dues
Annual dues shall be ₦10,000 payable in full or installments.

## Article 5: Meetings
Quarterly meetings shall be held on the last Sunday of March, June, September, and December.
', true);
