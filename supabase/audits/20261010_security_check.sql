-- Security check (REVIEW.md Batch E, 2026-10-10) — READ ONLY, changes nothing.
-- Lists what the live database actually allows, because the base table rules
-- were created in the dashboard and aren't in the migration files.
-- Run in the Supabase SQL Editor, then Results → Download → CSV.

SELECT * FROM (
  -- 1. Which tables have row-level security switched on
  SELECT '1 rls' AS section, c.relname::text AS name,
         CASE WHEN c.relrowsecurity THEN 'RLS on' ELSE 'RLS OFF' END AS detail
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r'

  UNION ALL
  -- 2. Every row rule (policy) on app tables and storage
  SELECT '2 policy', p.schemaname || '.' || p.tablename || ' · ' || p.policyname,
         p.cmd || ' to ' || array_to_string(p.roles, ',')
         || ' | using: ' || COALESCE(p.qual, '-')
         || ' | check: ' || COALESCE(p.with_check, '-')
  FROM pg_policies p
  WHERE p.schemaname IN ('public', 'storage')

  UNION ALL
  -- 3. What signed-out (anon) and signed-in (authenticated) roles may do per table
  SELECT '3 grant', g.table_name || ' · ' || g.grantee,
         string_agg(g.privilege_type, ',' ORDER BY g.privilege_type)
  FROM information_schema.role_table_grants g
  WHERE g.table_schema = 'public' AND g.grantee IN ('anon', 'authenticated')
  GROUP BY g.table_name, g.grantee

  UNION ALL
  -- 4. Database functions: who can call them, and are they safe-by-design
  SELECT '4 function', p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
         CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'invoker' END
         || ' | search_path set: ' || CASE WHEN array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 'yes' ELSE 'NO' END
         || ' | signed-out can call: ' || CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'YES' ELSE 'no' END
         || ' | signed-in can call: ' || CASE WHEN has_function_privilege('authenticated', p.oid, 'EXECUTE') THEN 'yes' ELSE 'no' END
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'

  UNION ALL
  -- 5. Storage buckets
  SELECT '5 bucket', b.id,
         'public: ' || b.public || ' | max bytes: ' || COALESCE(b.file_size_limit::text, 'none')
         || ' | types: ' || COALESCE(array_to_string(b.allowed_mime_types, ','), 'any')
  FROM storage.buckets b

  UNION ALL
  -- 6. Views (can bypass row rules unless security_invoker is on)
  SELECT '6 view', c.relname::text,
         'security_invoker: ' || COALESCE((SELECT option_value FROM pg_options_to_table(c.reloptions) WHERE option_name = 'security_invoker'), 'off')
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'v'
) checks
ORDER BY section, name;
