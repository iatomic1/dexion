-- +goose Up
-- +goose StatementBegin

-- Drop the old check constraint on alerts.metric
ALTER TABLE alerts
  DROP CONSTRAINT IF EXISTS alerts_metric_check;

-- Add new check constraint with updated allowed values
ALTER TABLE alerts
  ADD CONSTRAINT alerts_metric_check
  CHECK (metric IN ('price', 'liquidity', 'holders', 'marketcap'));

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Revert to the original check constraint
ALTER TABLE alerts
  DROP CONSTRAINT IF EXISTS alerts_metric_check;

ALTER TABLE alerts
  ADD CONSTRAINT alerts_metric_check
  CHECK (metric IN ('price', 'volume', 'tvl', 'marketcap'));

-- +goose StatementEnd
