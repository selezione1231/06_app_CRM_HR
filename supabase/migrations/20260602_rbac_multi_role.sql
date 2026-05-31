-- ============================================================================
-- TODOS HUB — F0 RBAC multi-ruolo
-- ----------------------------------------------------------------------------
-- Una persona può avere N ruoli organizzativi: ogni accesso è concesso se
-- almeno uno dei ruoli posseduti dall'utente corrente è autorizzato.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Master dei ruoli (catalogo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles_master (
  code         TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  category     TEXT NOT NULL,             -- 'operational' | 'staff' | 'system'
  description  TEXT,
  is_system    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   SMALLINT NOT NULL DEFAULT 100,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles_master (code, label, category, description, sort_order) VALUES
  ('employee',    'Dipendente',            'operational', 'Accesso base APP Personale (timbra, ferie, buste paga)', 10),
  ('team_leader', 'Caposquadra',           'operational', 'Caposquadra: vede la propria squadra + assegnazioni', 20),
  ('pm',          'Project Manager',       'operational', 'Pianifica cantieri e approva timbrature/permessi', 30),
  ('netimpl',     'Network Implementation','operational', 'Tecnici ufficio: gestione squadre, pianificazione lavori', 40),
  ('hr',          'HR',                    'staff', 'Recruiting, anagrafica dipendenti, performance', 50),
  ('hse',         'HSE',                   'staff', 'Certificazioni, DPI, sorveglianza sanitaria, infortuni', 60),
  ('servizi_gen', 'Servizi Generali',      'staff', 'Flotta mezzi, sedi, impianti, beni & attrezzature', 70),
  ('it',          'IT',                    'staff', 'PC, telefoni, SIM, licenze, account, network, help desk', 80),
  ('acquisti',    'Acquisti',              'staff', 'Fornitori, listini, accordi quadro, RDA, ordini', 90),
  ('finance',     'Amministrazione',       'staff', 'Contabilità, controllo fatture, note spese', 100),
  ('sales',       'Commerciale',           'staff', 'Pipeline clienti, preventivi, accordi commerciali', 110),
  ('quality',     'Qualità',               'staff', 'Procedure ISO, audit qualità, non conformità', 120),
  ('direzione',   'Direzione',             'staff', 'Vista executive, KPI, cost dashboard', 130),
  ('admin',       'Admin (IT)',            'system', 'Override completo: configurazione sistema', 999)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;


-- ----------------------------------------------------------------------------
-- 2) Assegnazione ruoli ai dipendenti (N-N)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_roles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role_code      TEXT NOT NULL REFERENCES roles_master(code) ON DELETE RESTRICT,
  granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
  revoked_at     TIMESTAMPTZ,
  revoked_by     UUID REFERENCES employees(id) ON DELETE SET NULL,
  scope_pm_id    UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,  -- (opz.) limita ad un PM
  scope_dept     TEXT,                                                         -- (opz.) limita ad un reparto
  notes          TEXT,
  UNIQUE (employee_id, role_code, revoked_at)  -- 1 sola assegnazione attiva per coppia
);
CREATE INDEX IF NOT EXISTS idx_employee_roles_emp  ON employee_roles(employee_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_employee_roles_role ON employee_roles(role_code)  WHERE revoked_at IS NULL;


-- ----------------------------------------------------------------------------
-- 3) Helper functions
-- ----------------------------------------------------------------------------

-- Ruoli attivi del dipendente collegato all'utente auth corrente
CREATE OR REPLACE FUNCTION current_user_roles()
RETURNS TEXT[] AS $$
  SELECT COALESCE(ARRAY_AGG(er.role_code ORDER BY rm.sort_order), ARRAY[]::TEXT[])
  FROM employee_roles er
  JOIN roles_master rm ON rm.code = er.role_code
  JOIN employees e ON e.id = er.employee_id
  WHERE er.revoked_at IS NULL
    AND e.auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- True se l'utente loggato ha almeno uno dei ruoli passati
CREATE OR REPLACE FUNCTION has_role(VARIADIC needed TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM employee_roles er
    JOIN employees e ON e.id = er.employee_id
    WHERE er.revoked_at IS NULL
      AND e.auth_user_id = auth.uid()
      AND er.role_code = ANY(needed)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- True se l'utente loggato è admin (scorciatoia)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT has_role('admin');
$$ LANGUAGE sql STABLE;

-- Ruoli per un dipendente specifico
CREATE OR REPLACE FUNCTION employee_active_roles(emp_id UUID)
RETURNS TEXT[] AS $$
  SELECT COALESCE(ARRAY_AGG(role_code ORDER BY role_code), ARRAY[]::TEXT[])
  FROM employee_roles
  WHERE employee_id = emp_id AND revoked_at IS NULL;
$$ LANGUAGE sql STABLE;


-- ----------------------------------------------------------------------------
-- 4) RPC: assegna / revoca ruolo (chiamabili dal frontend)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION grant_role(p_employee_id UUID, p_role_code TEXT, p_notes TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE new_id UUID;
BEGIN
  IF NOT (has_role('admin','hr')) THEN
    RAISE EXCEPTION 'Permission denied: only admin/hr can grant roles';
  END IF;

  -- Idempotente: se esiste già attivo, lo ritorno
  SELECT id INTO new_id FROM employee_roles
   WHERE employee_id = p_employee_id AND role_code = p_role_code AND revoked_at IS NULL
   LIMIT 1;
  IF new_id IS NOT NULL THEN RETURN new_id; END IF;

  INSERT INTO employee_roles (employee_id, role_code, notes,
                              granted_by)
  VALUES (p_employee_id, p_role_code, p_notes,
          (SELECT id FROM employees WHERE auth_user_id = auth.uid()))
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION revoke_role(p_employee_id UUID, p_role_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF NOT (has_role('admin','hr')) THEN
    RAISE EXCEPTION 'Permission denied: only admin/hr can revoke roles';
  END IF;

  UPDATE employee_roles
     SET revoked_at = NOW(),
         revoked_by = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
   WHERE employee_id = p_employee_id
     AND role_code = p_role_code
     AND revoked_at IS NULL;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 5) Adeguamento helper WP esistenti (compatibilità)
-- ----------------------------------------------------------------------------
-- Il vecchio wp_is_admin() leggeva il JWT app_metadata; lo ridefinisco
-- per usare i nuovi ruoli (preserva backward compat con policy esistenti)
CREATE OR REPLACE FUNCTION wp_is_admin()
RETURNS BOOLEAN AS $$
  SELECT has_role('admin','hr');
$$ LANGUAGE sql STABLE;


-- ----------------------------------------------------------------------------
-- 6) RLS sulle nuove tabelle
-- ----------------------------------------------------------------------------
ALTER TABLE roles_master    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_roles  ENABLE ROW LEVEL SECURITY;

-- roles_master: lettura per chiunque autenticato
CREATE POLICY "read_roles_master_auth" ON roles_master
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- employee_roles:
--   - admin/HR vedono tutto
--   - l'utente vede solo i propri ruoli
CREATE POLICY "read_emp_roles" ON employee_roles
  FOR SELECT USING (
    has_role('admin','hr')
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

-- Solo admin/HR possono scrivere direttamente (i frontend useranno le RPC sopra)
CREATE POLICY "write_emp_roles_admin_hr" ON employee_roles
  FOR ALL USING (has_role('admin','hr')) WITH CHECK (has_role('admin','hr'));


-- ----------------------------------------------------------------------------
-- 7) View utile: dipendenti con array dei ruoli
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_employees_with_roles AS
SELECT
  e.*,
  COALESCE(
    (SELECT ARRAY_AGG(er.role_code ORDER BY rm.sort_order)
     FROM employee_roles er
     JOIN roles_master rm ON rm.code = er.role_code
     WHERE er.employee_id = e.id AND er.revoked_at IS NULL),
    ARRAY[]::TEXT[]
  ) AS active_roles;


-- ============================================================================
-- FINE
-- ============================================================================
