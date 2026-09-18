ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS payments_created_idx ON payments (created_at DESC);
