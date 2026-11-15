-- Bootstrap the two-role model that underpins tenant isolation.
--
--   app_owner  — owns the schema, runs migrations & the isolation-test harness.
--                Has BYPASSRLS so migrations/seeds can write across stores.
--   app_user   — the role the API connects as for ALL tenant traffic.
--                Subject to RLS; can never bypass it. This is the security boundary.
--
-- Runs once, on first container init, as the postgres superuser.

CREATE ROLE app_owner LOGIN PASSWORD 'owner_pass' BYPASSRLS;
CREATE ROLE app_user  LOGIN PASSWORD 'app_pass';

-- app_owner owns the database and the public schema so migrations can manage objects.
ALTER DATABASE mercato OWNER TO app_owner;

\connect mercato

ALTER SCHEMA public OWNER TO app_owner;

-- app_user needs to use the schema and operate on the tables migrations will create.
GRANT USAGE ON SCHEMA public TO app_user;

-- Future tables/sequences created by app_owner are automatically usable by app_user
-- (DML only — RLS policies still constrain which ROWS it may touch).
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;
ALTER DEFAULT PRIVILEGES FOR ROLE app_owner IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO app_user;
