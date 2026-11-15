-- Mercato — Transactional outbox. Domain events are written in the same
-- transaction as the state change; a relay publishes them asynchronously (to
-- search indexing, webhooks, email). The BullMQ relay/worker requires Redis and
-- is wired separately; this is the durable event log it drains.

CREATE TABLE outbox_event (
  id           uuid PRIMARY KEY DEFAULT uuidv7(),
  store_id     uuid NOT NULL REFERENCES store(id) ON DELETE CASCADE,
  type         text NOT NULL,
  payload      jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);
CREATE INDEX outbox_unpublished_idx ON outbox_event (store_id, created_at) WHERE published_at IS NULL;

ALTER TABLE outbox_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_event FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON outbox_event
  USING (store_id = current_store_id()) WITH CHECK (store_id = current_store_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON outbox_event TO app_user;
