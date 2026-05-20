-- Partner revenue & payout tracking in rubles (₽)
--
-- Previously everything was in Telegram Stars which aren't rubles.
-- Subscriptions are priced in rubles (Basic 300₽, Premium 750₽, Day Pass 75₽),
-- so partner revenue is naturally computed in rubles too.
--
-- Stars payments: partner_revenue_rub = plan_price_rub * share_bps / 10000
-- YooKassa payments: partner_revenue_rub = amount_kopecks/100 * share_bps / 10000
--
-- partner_payouts.amount_rub stores the ruble amount for new payout requests.
-- Old rows keep amount_stars only (amount_rub will be NULL for pre-migration rows).

ALTER TABLE payments ADD COLUMN partner_revenue_rub REAL NOT NULL DEFAULT 0;

-- YooKassa payments had no partner attribution at all — add it now.
ALTER TABLE yk_payments ADD COLUMN attributed_partner_id INTEGER;
ALTER TABLE yk_payments ADD COLUMN revenue_share_bps_snapshot INTEGER;
ALTER TABLE yk_payments ADD COLUMN partner_revenue_rub REAL NOT NULL DEFAULT 0;

-- Payouts now request in rubles.
ALTER TABLE partner_payouts ADD COLUMN amount_rub REAL;

CREATE INDEX IF NOT EXISTS idx_yk_payments_partner
  ON yk_payments(attributed_partner_id)
  WHERE attributed_partner_id IS NOT NULL;
