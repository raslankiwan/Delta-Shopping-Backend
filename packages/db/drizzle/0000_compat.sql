-- Portability shim for `uuidv7()`.
--
-- Postgres 18 ships `uuidv7()` natively (time-ordered UUIDs) and this is a no-op
-- there. On Postgres < 18 (e.g. a local dev box or CI image that predates 18) we
-- define a fallback so the schema's `DEFAULT uuidv7()` still resolves. The
-- fallback returns a random v4 UUID: functionally identical for correctness and
-- all isolation tests (unique, valid UUIDs); it only forgoes the time-ordering
-- that makes native v7 index-friendly. Production runs on Postgres 18 (native).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uuidv7') THEN
    EXECUTE $f$
      CREATE FUNCTION public.uuidv7() RETURNS uuid
        LANGUAGE sql
        VOLATILE
      AS 'SELECT gen_random_uuid()'
    $f$;
  END IF;
END $$;
