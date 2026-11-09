CREATE TABLE IF NOT EXISTS households (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    created_by_user_id VARCHAR(180) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS household_members (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id),
    user_id VARCHAR(180) NOT NULL,
    email VARCHAR(320),
    display_name VARCHAR(180),
    role VARCHAR(20) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_household_member UNIQUE (household_id, user_id)
);

CREATE TABLE IF NOT EXISTS household_invitations (
    id BIGSERIAL PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id),
    email VARCHAR(320) NOT NULL,
    role VARCHAR(20) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    invited_by_user_id VARCHAR(180) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ
);

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS household_id BIGINT;

INSERT INTO households (name, created_by_user_id)
SELECT 'My household', s.owner_id
FROM subscriptions s
WHERE NOT EXISTS (
    SELECT 1 FROM households h WHERE h.created_by_user_id = s.owner_id
)
GROUP BY s.owner_id;

INSERT INTO household_members (household_id, user_id, email, role)
SELECT h.id, h.created_by_user_id,
       (SELECT s.owner_email FROM subscriptions s WHERE s.owner_id = h.created_by_user_id AND s.owner_email IS NOT NULL ORDER BY s.id DESC LIMIT 1),
       'OWNER'
FROM households h
WHERE NOT EXISTS (
    SELECT 1 FROM household_members m WHERE m.household_id = h.id AND m.user_id = h.created_by_user_id
)
;

UPDATE subscriptions s SET household_id = h.id
FROM households h
WHERE s.household_id IS NULL AND h.created_by_user_id = s.owner_id;

CREATE INDEX IF NOT EXISTS idx_subscription_household_date ON subscriptions (household_id, next_payment_date, id);
CREATE INDEX IF NOT EXISTS idx_household_member_user ON household_members (user_id, household_id);
CREATE INDEX IF NOT EXISTS idx_household_invite_hash ON household_invitations (token_hash);
