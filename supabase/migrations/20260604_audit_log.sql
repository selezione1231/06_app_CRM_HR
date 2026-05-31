-- ============================================================================
-- TODOS HUB — F0 Audit Log immutabile
-- ----------------------------------------------------------------------------
-- Traccia trasversale di TUTTE le modifiche critiche.
-- Solo INSERT è possibile sulla tabella: UPDATE e DELETE sono revocati a
-- livello di privilegi, rendendola di fatto un append-only log.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabella principale
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cosa è stato modificato
  entity_type         TEXT NOT NULL,        -- 'employees','wp_assignments','wp_leave_requests','employee_roles',...
  entity_id           UUID,
  entity_label        TEXT,                 -- best-effort identificazione (es. 'Mario Rossi', 'BG24043_005')

  -- Azione
  action              TEXT NOT NULL CHECK (action IN ('insert','update','delete','approve','reject','login','grant_role','revoke_role','dismiss','restore')),
  source_module       TEXT NOT NULL DEFAULT 'system',  -- 'hr','hse','wp','it','acquisti','servizi_gen','system'

  -- Chi
  actor_employee_id   UUID REFERENCES employees(id) ON DELETE SET NULL,
  actor_email         TEXT,
  actor_roles         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Cosa è cambiato
  payload_before      JSONB,
  payload_after       JSONB,
  changed_fields      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  -- Contesto opzionale
  ip_address          INET,
  user_agent          TEXT,
  notes               TEXT,

  -- Quando
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor      ON audit_log(actor_employee_id) WHERE actor_employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_created    ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_module     ON audit_log(source_module);


-- ----------------------------------------------------------------------------
-- 2) Immutabilità: revoke UPDATE/DELETE su tutti i ruoli
-- ----------------------------------------------------------------------------
-- (le RLS impediscono già il SELECT non autorizzato, ma per UPDATE/DELETE
--  blocchiamo a livello DB negando i privilegi a chiunque tranne owner DB)
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_log FROM authenticated;
REVOKE UPDATE, DELETE ON audit_log FROM anon;

-- Inserimento consentito solo via funzione SECURITY DEFINER (non direttamente)
REVOKE INSERT ON audit_log FROM authenticated;
REVOKE INSERT ON audit_log FROM anon;


-- ----------------------------------------------------------------------------
-- 3) Helper: scrive una entry (SECURITY DEFINER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_write(
  p_entity_type   TEXT,
  p_entity_id     UUID,
  p_action        TEXT,
  p_source_module TEXT DEFAULT 'system',
  p_entity_label  TEXT DEFAULT NULL,
  p_payload_before JSONB DEFAULT NULL,
  p_payload_after  JSONB DEFAULT NULL,
  p_notes         TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_actor_id     UUID;
  v_actor_email  TEXT;
  v_actor_roles  TEXT[];
  v_changed      TEXT[];
  v_id           UUID;
BEGIN
  SELECT id, email INTO v_actor_id, v_actor_email
    FROM employees WHERE auth_user_id = auth.uid() LIMIT 1;
  v_actor_roles := COALESCE(current_user_roles(), ARRAY[]::TEXT[]);

  -- Diff: chiavi che differiscono tra before e after
  IF p_payload_before IS NOT NULL AND p_payload_after IS NOT NULL THEN
    SELECT ARRAY_AGG(k) INTO v_changed FROM (
      SELECT key AS k
      FROM jsonb_each(p_payload_after) a
      WHERE p_payload_before->key IS DISTINCT FROM a.value
      UNION
      SELECT key
      FROM jsonb_each(p_payload_before) b
      WHERE p_payload_after->key IS DISTINCT FROM b.value
    ) AS diff;
  END IF;

  INSERT INTO audit_log (
    entity_type, entity_id, entity_label, action, source_module,
    actor_employee_id, actor_email, actor_roles,
    payload_before, payload_after, changed_fields, notes
  ) VALUES (
    p_entity_type, p_entity_id, p_entity_label, p_action, p_source_module,
    v_actor_id, v_actor_email, v_actor_roles,
    p_payload_before, p_payload_after, COALESCE(v_changed, ARRAY[]::TEXT[]), p_notes
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 4) Trigger function generico, applicabile a qualunque tabella
-- ----------------------------------------------------------------------------
-- Usage:
--   CREATE TRIGGER trg_audit_X
--     AFTER INSERT OR UPDATE OR DELETE ON <table>
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger('<module>', '<entity_label_column>');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_module       TEXT := COALESCE(TG_ARGV[0], 'system');
  v_label_col    TEXT := COALESCE(TG_ARGV[1], NULL);
  v_entity_label TEXT;
  v_payload_b    JSONB;
  v_payload_a    JSONB;
  v_action       TEXT;
  v_id           UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action    := 'insert';
    v_payload_a := to_jsonb(NEW);
    v_id        := (to_jsonb(NEW)->>'id')::UUID;
    IF v_label_col IS NOT NULL THEN v_entity_label := to_jsonb(NEW)->>v_label_col; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action    := 'update';
    v_payload_b := to_jsonb(OLD);
    v_payload_a := to_jsonb(NEW);
    v_id        := (to_jsonb(NEW)->>'id')::UUID;
    IF v_label_col IS NOT NULL THEN v_entity_label := to_jsonb(NEW)->>v_label_col; END IF;
  ELSE  -- DELETE
    v_action    := 'delete';
    v_payload_b := to_jsonb(OLD);
    v_id        := (to_jsonb(OLD)->>'id')::UUID;
    IF v_label_col IS NOT NULL THEN v_entity_label := to_jsonb(OLD)->>v_label_col; END IF;
  END IF;

  PERFORM audit_write(
    TG_TABLE_NAME, v_id, v_action, v_module,
    v_entity_label, v_payload_b, v_payload_a, NULL
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 5) Applico i trigger alle tabelle critiche
-- ----------------------------------------------------------------------------

-- employees (modifiche anagrafica + ruoli WP)
DROP TRIGGER IF EXISTS trg_audit_employees ON employees;
CREATE TRIGGER trg_audit_employees
  AFTER INSERT OR UPDATE OR DELETE ON employees
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('hr', 'name');

-- employee_roles (concessione / revoca ruoli)
DROP TRIGGER IF EXISTS trg_audit_employee_roles ON employee_roles;
CREATE TRIGGER trg_audit_employee_roles
  AFTER INSERT OR UPDATE OR DELETE ON employee_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('hr', 'role_code');

-- wp_assignments (pianificazione cantieri)
DROP TRIGGER IF EXISTS trg_audit_wp_assignments ON wp_assignments;
CREATE TRIGGER trg_audit_wp_assignments
  AFTER INSERT OR UPDATE OR DELETE ON wp_assignments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('wp', NULL);

-- wp_leave_requests (richieste + decisioni)
DROP TRIGGER IF EXISTS trg_audit_wp_leave_requests ON wp_leave_requests;
CREATE TRIGGER trg_audit_wp_leave_requests
  AFTER INSERT OR UPDATE OR DELETE ON wp_leave_requests
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('wp', 'type');

-- wp_time_entries (approvazioni ore)
DROP TRIGGER IF EXISTS trg_audit_wp_time_entries ON wp_time_entries;
CREATE TRIGGER trg_audit_wp_time_entries
  AFTER INSERT OR UPDATE OR DELETE ON wp_time_entries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('wp', NULL);

-- wp_clients
DROP TRIGGER IF EXISTS trg_audit_wp_clients ON wp_clients;
CREATE TRIGGER trg_audit_wp_clients
  AFTER INSERT OR UPDATE OR DELETE ON wp_clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('servizi_gen', 'name');

-- wp_sites
DROP TRIGGER IF EXISTS trg_audit_wp_sites ON wp_sites;
CREATE TRIGGER trg_audit_wp_sites
  AFTER INSERT OR UPDATE OR DELETE ON wp_sites
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('wp', 'code');

-- wp_vehicles
DROP TRIGGER IF EXISTS trg_audit_wp_vehicles ON wp_vehicles;
CREATE TRIGGER trg_audit_wp_vehicles
  AFTER INSERT OR UPDATE OR DELETE ON wp_vehicles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('servizi_gen', 'plate');

-- wp_vehicle_expiries / wp_fuel_cards / wp_telepass (scadenze critiche)
DROP TRIGGER IF EXISTS trg_audit_wp_vehicle_expiries ON wp_vehicle_expiries;
CREATE TRIGGER trg_audit_wp_vehicle_expiries
  AFTER INSERT OR UPDATE OR DELETE ON wp_vehicle_expiries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('servizi_gen', 'type');

DROP TRIGGER IF EXISTS trg_audit_wp_fuel_cards ON wp_fuel_cards;
CREATE TRIGGER trg_audit_wp_fuel_cards
  AFTER INSERT OR UPDATE OR DELETE ON wp_fuel_cards
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('servizi_gen', 'number');

-- wp_docs (documenti distribuiti)
DROP TRIGGER IF EXISTS trg_audit_wp_docs ON wp_docs;
CREATE TRIGGER trg_audit_wp_docs
  AFTER INSERT OR UPDATE OR DELETE ON wp_docs
  FOR EACH ROW EXECUTE FUNCTION audit_trigger('hr', 'title');


-- ----------------------------------------------------------------------------
-- 6) Helpers di lettura (per il frontend)
-- ----------------------------------------------------------------------------

-- Storico di una entità specifica
CREATE OR REPLACE FUNCTION audit_entity(
  p_entity_type TEXT,
  p_entity_id   UUID,
  p_limit       INTEGER DEFAULT 50
)
RETURNS SETOF audit_log AS $$
  SELECT * FROM audit_log
   WHERE entity_type = p_entity_type
     AND entity_id = p_entity_id
   ORDER BY created_at DESC
   LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Le mie azioni recenti
CREATE OR REPLACE FUNCTION audit_my_actions(p_limit INTEGER DEFAULT 100)
RETURNS SETOF audit_log AS $$
  SELECT * FROM audit_log
   WHERE actor_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
   ORDER BY created_at DESC
   LIMIT p_limit;
$$ LANGUAGE sql STABLE;

-- Feed admin: tutto il flusso (filtrabile dal client)
CREATE OR REPLACE FUNCTION audit_recent(p_limit INTEGER DEFAULT 200)
RETURNS SETOF audit_log AS $$
  SELECT * FROM audit_log
   WHERE has_role('admin','hr','direzione')
   ORDER BY created_at DESC
   LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 7) RLS
-- ----------------------------------------------------------------------------
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Lettura:
--   - admin, HR, direzione vedono tutto
--   - utente vede le proprie azioni
--   - utente vede gli audit relativi a sé stesso (entity_type='employees' e entity_id=mio)
CREATE POLICY "audit_read" ON audit_log
  FOR SELECT USING (
    has_role('admin','hr','direzione')
    OR actor_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
    OR (entity_type = 'employees' AND entity_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()))
  );

-- Nessun INSERT diretto: solo via audit_write() / audit_trigger() che sono SECURITY DEFINER
-- Nessun UPDATE/DELETE possibile (revocati i privilegi sopra)

-- ============================================================================
-- FINE
-- ============================================================================
