-- =====================================================================
-- CROWDSHIPPING PLATFORM — DATABASE SCHEMA (PostgreSQL)
-- A replica-style design for a LADX-like peer-to-peer delivery service
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------------------------------------------------------------------
-- 2. ENUM TYPES
-- ---------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('sender', 'traveler', 'both', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE journey_status AS ENUM ('upcoming', 'in_transit', 'completed', 'cancelled');
CREATE TYPE request_status AS ENUM (
  'pending',        -- sender submitted, awaiting traveler acceptance
  'accepted',       -- traveler accepted
  'rejected',
  'picked_up',      -- item collected from sender
  'in_transit',
  'delivered',
  'disputed',
  'cancelled'
);
CREATE TYPE payment_status AS ENUM ('pending', 'held_in_escrow', 'released', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('card', 'mobile_money', 'mpesa', 'usdt', 'wallet');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');

-- ---------------------------------------------------------------------
-- 3. CORE USER TABLES
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             CITEXT UNIQUE NOT NULL,
  phone_number      VARCHAR(20) UNIQUE,
  password_hash     TEXT NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  role              user_role NOT NULL DEFAULT 'sender',
  profile_photo_url TEXT,
  country_code      CHAR(2),                 -- ISO 3166-1 alpha-2
  date_of_birth     DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  rating_avg        NUMERIC(3,2) DEFAULT 0.00,
  rating_count      INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_verifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_document_type  VARCHAR(50),              -- passport, national_id, drivers_license
  id_document_url   TEXT,
  selfie_url        TEXT,
  status            verification_status NOT NULL DEFAULT 'unverified',
  reviewed_by       UUID REFERENCES users(id), -- admin who reviewed
  reviewed_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label         VARCHAR(50),                  -- 'home', 'office', etc.
  line1         TEXT NOT NULL,
  line2         TEXT,
  city          VARCHAR(100) NOT NULL,
  country_code  CHAR(2) NOT NULL,
  postal_code   VARCHAR(20),
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. WALLET / PAYMENTS
-- ---------------------------------------------------------------------
CREATE TABLE wallets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  currency      CHAR(3) NOT NULL DEFAULT 'USD',
  balance       NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_methods (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method_type     payment_method NOT NULL,
  provider_ref    TEXT,                       -- token/id from payment processor
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 5. JOURNEYS (traveler-listed trips)
-- ---------------------------------------------------------------------
CREATE TABLE journeys (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  traveler_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin_country          CHAR(2) NOT NULL,
  origin_city             VARCHAR(100) NOT NULL,
  destination_country     CHAR(2) NOT NULL,
  destination_city        VARCHAR(100) NOT NULL,
  departure_date          DATE NOT NULL,
  arrival_date            DATE NOT NULL,
  flight_number           VARCHAR(20),
  available_weight_kg     NUMERIC(6,2) NOT NULL,
  price_per_kg            NUMERIC(10,2),        -- traveler's rate
  currency                CHAR(3) NOT NULL DEFAULT 'USD',
  notes                   TEXT,
  status                  journey_status NOT NULL DEFAULT 'upcoming',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journeys_route ON journeys (origin_country, destination_country, departure_date);

-- ---------------------------------------------------------------------
-- 6. ITEM CATEGORIES (for restricted/allowed goods rules)
-- ---------------------------------------------------------------------
CREATE TABLE item_categories (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  description   TEXT
);

-- ---------------------------------------------------------------------
-- 7. DELIVERY REQUESTS (sender's package matched to a journey)
-- ---------------------------------------------------------------------
CREATE TABLE delivery_requests (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_id           UUID NOT NULL REFERENCES journeys(id) ON DELETE CASCADE,
  traveler_id          UUID NOT NULL REFERENCES users(id),   -- denormalized for convenience
  item_category_id     INTEGER REFERENCES item_categories(id),
  item_description     TEXT NOT NULL,
  item_weight_kg       NUMERIC(6,2) NOT NULL,
  declared_value       NUMERIC(12,2),
  pickup_address_id    UUID REFERENCES addresses(id),
  dropoff_address_id   UUID REFERENCES addresses(id),
  recipient_name       VARCHAR(150),
  recipient_phone      VARCHAR(20),
  agreed_price         NUMERIC(10,2) NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'USD',
  status               request_status NOT NULL DEFAULT 'pending',
  pickup_photo_url     TEXT,
  delivery_photo_url   TEXT,
  pickup_confirmed_at  TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_requests_sender ON delivery_requests (sender_id);
CREATE INDEX idx_requests_traveler ON delivery_requests (traveler_id);
CREATE INDEX idx_requests_status ON delivery_requests (status);

-- Status history for auditability / tracking timeline
CREATE TABLE delivery_status_events (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  status               request_status NOT NULL,
  note                 TEXT,
  changed_by           UUID REFERENCES users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS / ESCROW / TRANSACTIONS
-- ---------------------------------------------------------------------
CREATE TABLE transactions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  payer_id             UUID NOT NULL REFERENCES users(id),
  payee_id             UUID REFERENCES users(id),          -- traveler, once released
  amount               NUMERIC(12,2) NOT NULL,
  platform_fee         NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency             CHAR(3) NOT NULL DEFAULT 'USD',
  method                payment_method NOT NULL,
  status                payment_status NOT NULL DEFAULT 'pending',
  provider_reference     TEXT,                              -- e.g. Stripe/Flutterwave charge id
  held_at               TIMESTAMPTZ,
  released_at            TIMESTAMPTZ,
  refunded_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_request ON transactions (delivery_request_id);

-- ---------------------------------------------------------------------
-- 9. INSURANCE (optional coverage per delivery)
-- ---------------------------------------------------------------------
CREATE TABLE insurance_policies (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL UNIQUE REFERENCES delivery_requests(id) ON DELETE CASCADE,
  coverage_amount       NUMERIC(12,2) NOT NULL,
  premium              NUMERIC(10,2) NOT NULL,
  provider             VARCHAR(100),
  policy_reference      TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 10. REVIEWS & RATINGS
-- ---------------------------------------------------------------------
CREATE TABLE reviews (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  reviewer_id           UUID NOT NULL REFERENCES users(id),
  reviewee_id           UUID NOT NULL REFERENCES users(id),
  rating                SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (delivery_request_id, reviewer_id)
);

-- ---------------------------------------------------------------------
-- 11. MESSAGING (sender <-> traveler chat per request)
-- ---------------------------------------------------------------------
CREATE TABLE messages (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  sender_id             UUID NOT NULL REFERENCES users(id),
  body                 TEXT,
  attachment_url         TEXT,
  read_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_request ON messages (delivery_request_id, created_at);

-- ---------------------------------------------------------------------
-- 12. DISPUTES
-- ---------------------------------------------------------------------
CREATE TABLE disputes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_request_id  UUID NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  raised_by             UUID NOT NULL REFERENCES users(id),
  reason               TEXT NOT NULL,
  status                dispute_status NOT NULL DEFAULT 'open',
  resolution           TEXT,
  resolved_by           UUID REFERENCES users(id),
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 13. NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel       notification_channel NOT NULL,
  title         VARCHAR(200) NOT NULL,
  body          TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  related_id     UUID,                          -- e.g. delivery_request_id, journey_id
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read);

-- ---------------------------------------------------------------------
-- 14. REFERENCE / LOOKUP TABLES
-- ---------------------------------------------------------------------
CREATE TABLE countries (
  code      CHAR(2) PRIMARY KEY,   -- ISO 3166-1 alpha-2
  name      VARCHAR(100) NOT NULL,
  currency  CHAR(3)
);

-- ---------------------------------------------------------------------
-- 15. TRIGGERS: auto-update `updated_at`
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_journeys_updated_at BEFORE UPDATE ON journeys
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON delivery_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();