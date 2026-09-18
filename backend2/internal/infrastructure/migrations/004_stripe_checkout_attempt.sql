ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS checkout_attempt INTEGER NOT NULL DEFAULT 0;

ALTER TABLE payments
    DROP CONSTRAINT IF EXISTS payments_checkout_attempt_nonnegative;

ALTER TABLE payments
    ADD CONSTRAINT payments_checkout_attempt_nonnegative CHECK (checkout_attempt >= 0);
