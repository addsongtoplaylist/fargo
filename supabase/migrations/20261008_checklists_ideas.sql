-- v0.5.4 · Personal checklists + idea suggestions
-- Specs: docs/CHECKLISTS.md, docs/IDEAS.md · Access: docs/PERMISSIONS.md
-- Run in the Supabase SQL Editor BEFORE deploying the app update.
-- Run 20261008_checklists_ideas_CHECK.sql first (read-only) to see which
-- trips' old lists will be copied to their planner.
--
-- Additive: new tables, new columns, new functions. The old checklists /
-- checklist_items tables, the ideas / activities policies and every existing
-- function stay untouched (the parked native app still uses them) — except
-- get_shared_trip, which now returns empty checklists and ideas (share page
-- = header + Schedule only). Undo: 20261008_checklists_ideas_UNDO.sql
--
-- Every function identifies the caller with auth.uid() and is closed to
-- signed-out users. Helper names are specific to this feature on purpose
-- (production has older helpers such as is_trip_planner — never touch them).

-- ════════════════════════════════════════════════════════════════
-- Part A · Personal checklists
-- ════════════════════════════════════════════════════════════════

-- A1. Tables. trip_id null = one of your default lists.
CREATE TABLE IF NOT EXISTS my_checklists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trip_id     uuid REFERENCES trips(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS my_checklists_owner_trip_idx ON my_checklists (account_id, trip_id);

CREATE TABLE IF NOT EXISTS my_checklist_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     uuid NOT NULL REFERENCES my_checklists(id) ON DELETE CASCADE,
  text        text NOT NULL CHECK (char_length(btrim(text)) BETWEEN 1 AND 300),
  done        boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS my_checklist_items_list_idx ON my_checklist_items (list_id);

-- "Your defaults were already copied into this trip" — so deleting every
-- list doesn't bring them back, and two quick loads can't copy twice.
CREATE TABLE IF NOT EXISTS my_checklist_setup (
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, trip_id)
);

-- A2. Helpers
CREATE OR REPLACE FUNCTION my_lists_account_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id FROM accounts WHERE auth_id = auth.uid() LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION my_lists_account_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION my_lists_account_id() TO authenticated;

-- Is the signed-in caller on this trip (planner or member with an account)?
CREATE OR REPLACE FUNCTION my_lists_on_trip(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM travellers tr
    JOIN accounts a ON a.id = tr.account_id
    WHERE tr.trip_id = p_trip_id
      AND a.auth_id = auth.uid()
  ) OR EXISTS (
    SELECT 1
    FROM trips t
    JOIN accounts a ON a.id = t.planner_id
    WHERE t.id = p_trip_id
      AND a.auth_id = auth.uid()
  );
$$;
REVOKE EXECUTE ON FUNCTION my_lists_on_trip(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION my_lists_on_trip(uuid) TO authenticated;

-- A3. Row-level security: only your own lists; a trip list also needs you
--     to be on that trip (lists stay hidden after leaving, back on rejoin).
ALTER TABLE my_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_checklist_setup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner manages own checklists" ON my_checklists;
CREATE POLICY "Owner manages own checklists" ON my_checklists
  FOR ALL TO authenticated
  USING (account_id = my_lists_account_id() AND (trip_id IS NULL OR my_lists_on_trip(trip_id)))
  WITH CHECK (account_id = my_lists_account_id() AND (trip_id IS NULL OR my_lists_on_trip(trip_id)));

DROP POLICY IF EXISTS "Owner manages own checklist items" ON my_checklist_items;
CREATE POLICY "Owner manages own checklist items" ON my_checklist_items
  FOR ALL TO authenticated
  USING (list_id IN (SELECT id FROM my_checklists))
  WITH CHECK (list_id IN (SELECT id FROM my_checklists));

-- Setup rows: readable by the owner, written only by setup_my_checklists()
DROP POLICY IF EXISTS "Owner reads own checklist setup" ON my_checklist_setup;
CREATE POLICY "Owner reads own checklist setup" ON my_checklist_setup
  FOR SELECT TO authenticated
  USING (account_id = my_lists_account_id());

-- A4. Copy my default lists into this trip — once per trip
CREATE OR REPLACE FUNCTION setup_my_checklists(p_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid := my_lists_account_id();
  v_new     uuid;
  r         record;
BEGIN
  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT my_lists_on_trip(p_trip_id) THEN
    RAISE EXCEPTION 'Not on this trip';
  END IF;

  INSERT INTO my_checklist_setup (account_id, trip_id)
  VALUES (v_account, p_trip_id)
  ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN
    RETURN; -- already set up
  END IF;

  FOR r IN
    SELECT id, name, sort_order FROM my_checklists
    WHERE account_id = v_account AND trip_id IS NULL
    ORDER BY sort_order, created_at
  LOOP
    INSERT INTO my_checklists (account_id, trip_id, name, sort_order)
    VALUES (v_account, p_trip_id, r.name, r.sort_order)
    RETURNING id INTO v_new;

    INSERT INTO my_checklist_items (list_id, text, done, sort_order)
    SELECT v_new, text, false, sort_order
    FROM my_checklist_items WHERE list_id = r.id;
  END LOOP;
END;
$$;
REVOKE EXECUTE ON FUNCTION setup_my_checklists(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION setup_my_checklists(uuid) TO authenticated;

-- A5. "Save to my defaults": copy a trip list (unticked) into your
--     defaults, replacing a default with the same name.
CREATE OR REPLACE FUNCTION save_my_checklist_as_default(p_list_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid := my_lists_account_id();
  v_list    my_checklists%ROWTYPE;
  v_order   integer;
  v_new     uuid;
BEGIN
  SELECT * INTO v_list FROM my_checklists
  WHERE id = p_list_id AND account_id = v_account AND trip_id IS NOT NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'List not found';
  END IF;

  -- Keep the replaced default's position, otherwise add at the end
  SELECT sort_order INTO v_order FROM my_checklists
  WHERE account_id = v_account AND trip_id IS NULL
    AND lower(btrim(name)) = lower(btrim(v_list.name))
  LIMIT 1;

  DELETE FROM my_checklists
  WHERE account_id = v_account AND trip_id IS NULL
    AND lower(btrim(name)) = lower(btrim(v_list.name));

  IF v_order IS NULL THEN
    SELECT COALESCE(MAX(sort_order) + 1, 0) INTO v_order FROM my_checklists
    WHERE account_id = v_account AND trip_id IS NULL;
  END IF;

  INSERT INTO my_checklists (account_id, trip_id, name, sort_order)
  VALUES (v_account, NULL, v_list.name, v_order)
  RETURNING id INTO v_new;

  INSERT INTO my_checklist_items (list_id, text, done, sort_order)
  SELECT v_new, text, false, sort_order
  FROM my_checklist_items WHERE list_id = p_list_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION save_my_checklist_as_default(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION save_my_checklist_as_default(uuid) TO authenticated;

-- A6. One-time copy (decision 1): each old shared list → the trip planner's
--     own list, ticks kept. Same ids as the old rows, so running this file
--     twice copies nothing twice. Old rows are left as they are.
INSERT INTO my_checklists (id, account_id, trip_id, name, sort_order, created_at)
SELECT c.id, t.planner_id, c.trip_id,
       COALESCE(NULLIF(left(btrim(c.name), 100), ''), 'Checklist'),
       c.sort_order, c.created_at
FROM checklists c
JOIN trips t ON t.id = c.trip_id
ON CONFLICT (id) DO NOTHING;

INSERT INTO my_checklist_items (id, list_id, text, done, sort_order, created_at)
SELECT ci.id, ci.checklist_id, left(btrim(ci.text), 300), ci.done, ci.sort_order, ci.created_at
FROM checklist_items ci
JOIN my_checklists m ON m.id = ci.checklist_id
WHERE btrim(ci.text) <> ''
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════════════
-- Part B · Idea suggestions
-- ════════════════════════════════════════════════════════════════

-- B1. Who suggested it. suggested_at is set only when a member (not the
--     planner) adds an idea — it drives the planner's badge, so ideas moved
--     back from Schedule never badge.
ALTER TABLE ideas      ADD COLUMN IF NOT EXISTS created_by   uuid REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE ideas      ADD COLUMN IF NOT EXISTS suggested_at timestamptz;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS suggested_by uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- B2. Is the signed-in caller this trip's planner?
CREATE OR REPLACE FUNCTION ideas_is_planner(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM trips t
    JOIN accounts a ON a.id = t.planner_id
    WHERE t.id = p_trip_id
      AND a.auth_id = auth.uid()
  );
$$;
REVOKE EXECUTE ON FUNCTION ideas_is_planner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ideas_is_planner(uuid) TO authenticated;

-- B3. Add an idea — anyone on the trip with an account
CREATE OR REPLACE FUNCTION add_idea(p_trip_id uuid, p_title text, p_link text, p_notes text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid := my_lists_account_id();
  v_order   integer;
  v_id      uuid;
BEGIN
  IF v_account IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;
  IF NOT my_lists_on_trip(p_trip_id) THEN
    RAISE EXCEPTION 'Not on this trip';
  END IF;
  IF p_title IS NULL OR char_length(btrim(p_title)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Title is required (max 200 characters)';
  END IF;

  SELECT COALESCE(MAX(sort_order) + 1, 0) INTO v_order FROM ideas WHERE trip_id = p_trip_id;

  INSERT INTO ideas (trip_id, title, link, notes, sort_order, created_by, suggested_at)
  VALUES (
    p_trip_id,
    btrim(p_title),
    NULLIF(btrim(COALESCE(p_link, '')), ''),
    NULLIF(btrim(COALESCE(p_notes, '')), ''),
    v_order,
    v_account,
    CASE WHEN ideas_is_planner(p_trip_id) THEN NULL ELSE now() END
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION add_idea(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION add_idea(uuid, text, text, text) TO authenticated;

-- B4. Edit an idea — the author or the planner. NULL = leave unchanged,
--     '' = clear (link / notes). Can't touch promoted / schedule fields.
CREATE OR REPLACE FUNCTION update_idea(p_idea_id uuid, p_title text, p_link text, p_notes text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid := my_lists_account_id();
  v_idea    ideas%ROWTYPE;
BEGIN
  SELECT * INTO v_idea FROM ideas WHERE id = p_idea_id;
  IF NOT FOUND OR v_account IS NULL THEN
    RAISE EXCEPTION 'Idea not found';
  END IF;
  IF NOT (ideas_is_planner(v_idea.trip_id)
          OR (v_idea.created_by = v_account AND my_lists_on_trip(v_idea.trip_id))) THEN
    RAISE EXCEPTION 'Only the person who suggested it or the planner can edit this idea';
  END IF;
  IF p_title IS NOT NULL AND char_length(btrim(p_title)) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Title is required (max 200 characters)';
  END IF;

  UPDATE ideas SET
    title = COALESCE(btrim(p_title), title),
    link  = CASE WHEN p_link  IS NULL THEN link  ELSE NULLIF(btrim(p_link), '')  END,
    notes = CASE WHEN p_notes IS NULL THEN notes ELSE NULLIF(btrim(p_notes), '') END
  WHERE id = p_idea_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION update_idea(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION update_idea(uuid, text, text, text) TO authenticated;

-- B5. Delete an idea — the author or the planner
CREATE OR REPLACE FUNCTION delete_idea(p_idea_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account uuid := my_lists_account_id();
  v_idea    ideas%ROWTYPE;
BEGIN
  SELECT * INTO v_idea FROM ideas WHERE id = p_idea_id;
  IF NOT FOUND OR v_account IS NULL THEN
    RAISE EXCEPTION 'Idea not found';
  END IF;
  IF NOT (ideas_is_planner(v_idea.trip_id)
          OR (v_idea.created_by = v_account AND my_lists_on_trip(v_idea.trip_id))) THEN
    RAISE EXCEPTION 'Only the person who suggested it or the planner can delete this idea';
  END IF;

  DELETE FROM ideas WHERE id = p_idea_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION delete_idea(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION delete_idea(uuid) TO authenticated;

-- B6. Planner's badge: when they last opened Prep
CREATE TABLE IF NOT EXISTS prep_seen (
  account_id  uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  trip_id     uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  seen_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, trip_id)
);
ALTER TABLE prep_seen ENABLE ROW LEVEL SECURITY;
-- No policies: read and written only through the two functions below.

-- Existing trips start at zero (decision 2: never count the backlog)
INSERT INTO prep_seen (account_id, trip_id, seen_at)
SELECT planner_id, id, now() FROM trips
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION mark_prep_seen(p_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT ideas_is_planner(p_trip_id) THEN
    RETURN; -- members have no badge
  END IF;
  INSERT INTO prep_seen (account_id, trip_id, seen_at)
  VALUES (my_lists_account_id(), p_trip_id, now())
  ON CONFLICT (account_id, trip_id) DO UPDATE SET seen_at = now();
END;
$$;
REVOKE EXECUTE ON FUNCTION mark_prep_seen(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION mark_prep_seen(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION prep_badge_count(p_trip_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE WHEN NOT ideas_is_planner(p_trip_id) THEN 0 ELSE (
    SELECT COUNT(*)::integer
    FROM ideas i
    JOIN trips t ON t.id = i.trip_id
    LEFT JOIN prep_seen s ON s.trip_id = i.trip_id AND s.account_id = my_lists_account_id()
    WHERE i.trip_id = p_trip_id
      AND i.suggested_at > COALESCE(s.seen_at, t.created_at)
  ) END;
$$;
REVOKE EXECUTE ON FUNCTION prep_badge_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION prep_badge_count(uuid) TO authenticated;

-- ════════════════════════════════════════════════════════════════
-- Part C · Share page: header + Schedule only
-- ════════════════════════════════════════════════════════════════
-- Same as 20260926_shared_trip_rpc.sql, except checklists and ideas are
-- always empty (keys kept so older app code doesn't break).

CREATE OR REPLACE FUNCTION get_shared_trip(p_code text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT json_build_object(
    'trip', json_build_object(
      'id', t.id,
      'name', t.name,
      'destination', t.destination,
      'start_date', t.start_date,
      'end_date', t.end_date,
      'trip_type', t.trip_type,
      'local_currency', t.local_currency,
      'fx_rate', t.fx_rate,
      'travellers', COALESCE((
        SELECT json_agg(json_build_object(
          'id', tr.id,
          'display_name', tr.display_name,
          'role', tr.role
        ))
        FROM travellers tr WHERE tr.trip_id = t.id
      ), '[]'::json)
    ),
    'activities', COALESCE((
      SELECT json_agg(json_build_object(
        'id', a.id,
        'date', a.date,
        'time', a.time,
        'title', a.title,
        'notes', a.notes,
        'category', a.category,
        'cost', a.cost,
        'place_name', a.place_name,
        'place_lat', a.place_lat,
        'place_lng', a.place_lng,
        'sort_order', a.sort_order
      ) ORDER BY a.date, a.sort_order)
      FROM activities a WHERE a.trip_id = t.id
    ), '[]'::json),
    'checklists', '[]'::json,
    'ideas', '[]'::json
  )
  FROM trips t
  WHERE t.share_code = p_code
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_shared_trip(text) TO anon, authenticated;
