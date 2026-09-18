ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS provider_session_id TEXT,
    ADD COLUMN IF NOT EXISTS provider_payment_intent_id TEXT,
    ADD COLUMN IF NOT EXISTS checkout_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_session_id_uq
    ON payments (provider_session_id)
    WHERE provider_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
