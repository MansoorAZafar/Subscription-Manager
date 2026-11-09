CREATE TABLE IF NOT EXISTS subscriptions (
    id BIGSERIAL PRIMARY KEY,
    owner_id VARCHAR(180) NOT NULL,
    owner_email VARCHAR(320),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    cycle VARCHAR(255) NOT NULL,
    next_payment_date DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_sent BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_subscription_owner ON subscriptions (owner_id);
