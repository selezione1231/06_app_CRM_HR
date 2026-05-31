-- ============================================================================
-- WORK-PRO TODOS (WP_2) — Schema Postgres / Supabase
-- ----------------------------------------------------------------------------
-- Modulo per la gestione cantieri, squadre, automezzi, reperibilità.
-- Si appoggia sulla tabella `employees` esistente del CRM HR (stessa anagrafica).
-- Multi-tenancy: ogni P.M. vede solo le proprie squadre e i propri cantieri.
-- Da applicare via Supabase Studio SQL Editor o `supabase db push`.
-- ============================================================================

-- Helper: trigger per updated_at -----------------------------------------
CREATE OR REPLACE FUNCTION wp_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 1. PROJECT MANAGERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_project_managers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,        -- es. c.fall
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  area         TEXT,                        -- es. "Lombardia Nord"
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_pm_updated BEFORE UPDATE ON wp_project_managers
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_pm_auth ON wp_project_managers(auth_user_id);


-- ============================================================================
-- 2. CLASSI DI COSTO
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_cost_classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,    -- A, B, C, CS
  label       TEXT NOT NULL,
  hourly_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- 3. SQUADRE
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_squads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  pm_id              UUID NOT NULL REFERENCES wp_project_managers(id) ON DELETE RESTRICT,
  leader_employee_id UUID,             -- → employees.id (FK aggiunta sotto)
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_squads_updated BEFORE UPDATE ON wp_squads
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_squads_pm ON wp_squads(pm_id);


-- ============================================================================
-- 4. EMPLOYEES — ESTENSIONE TABELLA ESISTENTE
-- ----------------------------------------------------------------------------
-- I dipendenti Work-Pro sono gli stessi del CRM HR.
-- Aggiungiamo solo le colonne specifiche del modulo cantieri.
-- ============================================================================
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS wp_code          TEXT UNIQUE,                   -- es. m.bettoni
  ADD COLUMN IF NOT EXISTS wp_squad_id      UUID REFERENCES wp_squads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS wp_pm_id         UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS wp_is_leader     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wp_cost_class_id UUID REFERENCES wp_cost_classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS wp_vehicle_id    UUID,                          -- FK a wp_vehicles, set sotto
  ADD COLUMN IF NOT EXISTS wp_oncall_type   TEXT CHECK (wp_oncall_type IN ('Nessuna','CDZ','Uffici','RADIO'));

CREATE INDEX IF NOT EXISTS idx_employees_wp_pm    ON employees(wp_pm_id);
CREATE INDEX IF NOT EXISTS idx_employees_wp_squad ON employees(wp_squad_id);

-- FK per leader_employee_id su wp_squads ora che employees è esteso
ALTER TABLE wp_squads
  DROP CONSTRAINT IF EXISTS fk_wp_squads_leader,
  ADD CONSTRAINT fk_wp_squads_leader
    FOREIGN KEY (leader_employee_id) REFERENCES employees(id) ON DELETE SET NULL;


-- ============================================================================
-- 5. CLIENTI / FORNITORI (mirror leggero da ARCA)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arca_code   TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  piva        TEXT,
  address     TEXT,
  type        TEXT NOT NULL DEFAULT 'Cliente' CHECK (type IN ('Cliente','Fornitore','Entrambi')),
  arca_synced_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_clients_updated BEFORE UPDATE ON wp_clients
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_clients_name ON wp_clients(name);


-- ============================================================================
-- 6. CANTIERI
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_sites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,    -- BG24043_005
  name            TEXT NOT NULL,
  client_id       UUID REFERENCES wp_clients(id) ON DELETE SET NULL,
  address         TEXT,
  is_maintenance  BOOLEAN NOT NULL DEFAULT FALSE,  -- codice in BLU
  start_date      DATE,
  end_date        DATE,
  notes           TEXT,
  arca_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_sites_updated BEFORE UPDATE ON wp_sites
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_sites_client ON wp_sites(client_id);


-- ============================================================================
-- 7. AUTOMEZZI
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_vehicles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate              TEXT UNIQUE NOT NULL,
  model              TEXT NOT NULL,
  fuel               TEXT CHECK (fuel IN ('Diesel','Benzina','GPL','Metano','Ibrido','Elettrico')),
  ownership          TEXT NOT NULL DEFAULT 'Proprietà' CHECK (ownership IN ('Proprietà','Noleggio')),
  supplier_id        UUID REFERENCES wp_clients(id) ON DELETE SET NULL,
  has_winter_tires   BOOLEAN NOT NULL DEFAULT FALSE,
  decommission_from  DATE,
  decommission_to    DATE,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_vehicles_updated BEFORE UPDATE ON wp_vehicles
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();

-- ora che wp_vehicles esiste, agganciamo FK su employees.wp_vehicle_id
ALTER TABLE employees
  DROP CONSTRAINT IF EXISTS fk_employees_wp_vehicle,
  ADD CONSTRAINT fk_employees_wp_vehicle
    FOREIGN KEY (wp_vehicle_id) REFERENCES wp_vehicles(id) ON DELETE SET NULL;

-- Scadenze (bollo / assicurazione / revisione / contratto noleggio)
CREATE TABLE IF NOT EXISTS wp_vehicle_expiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID NOT NULL REFERENCES wp_vehicles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('Bollo','Assicurazione','Revisione','Contratto Nol.','Altro')),
  due_date    DATE,                       -- NULL = "data assente" → segnalata
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_vexp_due ON wp_vehicle_expiries(due_date);
CREATE INDEX IF NOT EXISTS idx_wp_vexp_veh ON wp_vehicle_expiries(vehicle_id);

-- Pneumatici in deposito
CREATE TABLE IF NOT EXISTS wp_tires_storage (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id  UUID NOT NULL REFERENCES wp_vehicles(id) ON DELETE CASCADE,
  season      TEXT NOT NULL CHECK (season IN ('Invernali','Estivi')),
  location    TEXT,
  stored_at   DATE NOT NULL,
  removed_at  DATE
);

-- Tessere carburante
CREATE TABLE IF NOT EXISTS wp_fuel_cards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      TEXT UNIQUE NOT NULL,
  supplier    TEXT NOT NULL,             -- Eni, Q8, IP, ...
  vehicle_id  UUID REFERENCES wp_vehicles(id) ON DELETE SET NULL,
  expires_at  DATE,                      -- NULL = data assente
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_fc_exp ON wp_fuel_cards(expires_at);

-- Telepass
CREATE TABLE IF NOT EXISTS wp_telepass (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      TEXT UNIQUE NOT NULL,
  vehicle_id  UUID REFERENCES wp_vehicles(id) ON DELETE SET NULL,
  expires_at  DATE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_tp_exp ON wp_telepass(expires_at);


-- ============================================================================
-- 8. ASSEGNAZIONI / PIANIFICAZIONE SETTIMANALE (cuore del sistema)
-- ============================================================================
-- Una riga per dipendente × giorno.
-- Se "special" è impostato, la riga rappresenta ferie/malattia/TD/TN/RD/RN/...
-- e blocca la modifica del dipendente per quel giorno (vincolo applicativo).
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL,
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pm_id        UUID NOT NULL REFERENCES wp_project_managers(id) ON DELETE RESTRICT,
  site_id      UUID REFERENCES wp_sites(id) ON DELETE SET NULL,
  vehicle_id   UUID REFERENCES wp_vehicles(id) ON DELETE SET NULL,
  special      TEXT CHECK (special IN (
                  'Ferie','Ferie_IA','Malattia','Infortunio',
                  'Permesso','Permesso_IA',
                  'TD','TN','RD','RN'
                )),
  notes        TEXT,
  locked       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Una sola assegnazione "principale" per dipendente/giorno
  UNIQUE (date, employee_id)
);
CREATE TRIGGER trg_wp_ass_updated BEFORE UPDATE ON wp_assignments
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_ass_date_emp ON wp_assignments(date, employee_id);
CREATE INDEX IF NOT EXISTS idx_wp_ass_pm_date  ON wp_assignments(pm_id, date);
CREATE INDEX IF NOT EXISTS idx_wp_ass_site     ON wp_assignments(site_id);


-- ============================================================================
-- 9. RICHIESTE FERIE / PERMESSI (da APP dipendente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_leave_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('Ferie','Permesso')),
  date_from     DATE NOT NULL,
  date_to       DATE NOT NULL,
  full_day      BOOLEAN NOT NULL DEFAULT TRUE,
  time_from     TIME,
  time_to       TIME,
  reason_type   TEXT,    -- "Assistenza parenti", "Visita medica", ...
  motivation    TEXT,
  status        TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  approved_by   UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  approved_at   TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_lr_updated BEFORE UPDATE ON wp_leave_requests
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_lr_emp_status ON wp_leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_wp_lr_dates     ON wp_leave_requests(date_from, date_to);


-- ============================================================================
-- 10. NOTE DAI DIPENDENTI (da APP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_employee_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','high')),
  seen         BOOLEAN NOT NULL DEFAULT FALSE,
  seen_at      TIMESTAMPTZ,
  seen_by      UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_notes_emp_seen ON wp_employee_notes(employee_id, seen);


-- ============================================================================
-- 11. TIMBRATURE / INSERIMENTO ORE (da APP)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_time_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  entry_number    INTEGER NOT NULL DEFAULT 1,    -- supporta più inserimenti / giorno
  azienda         TEXT NOT NULL DEFAULT 'TODOS',
  client_id       UUID REFERENCES wp_clients(id) ON DELETE SET NULL,
  site_id         UUID REFERENCES wp_sites(id) ON DELETE SET NULL,
  vehicle_id      UUID REFERENCES wp_vehicles(id) ON DELETE SET NULL,
  hours           NUMERIC(5,2) NOT NULL,
  hours_approved  NUMERIC(5,2),               -- ore modificate in approvazione PM
  trasferta       BOOLEAN NOT NULL DEFAULT FALSE,
  pernottamento   BOOLEAN NOT NULL DEFAULT FALSE,
  notturno        BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  approved_by     UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  source          TEXT NOT NULL DEFAULT 'app' CHECK (source IN ('app','whatsapp','pm_manual')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, date, entry_number)
);
CREATE TRIGGER trg_wp_te_updated BEFORE UPDATE ON wp_time_entries
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_te_emp_date ON wp_time_entries(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_wp_te_status   ON wp_time_entries(status);

-- Spese collegate a una timbratura (4 righe dal form)
CREATE TABLE IF NOT EXISTS wp_time_entry_expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id  UUID NOT NULL REFERENCES wp_time_entries(id) ON DELETE CASCADE,
  position       SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 8),
  description    TEXT NOT NULL,
  amount         NUMERIC(10,2) NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_wp_te_expenses ON wp_time_entry_expenses(time_entry_id);


-- ============================================================================
-- 12. MY TODOS — DOCUMENTI DISTRIBUITI VIA APP
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_docs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  file_path            TEXT,                  -- Supabase Storage path
  visibility           TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN ('all','leaders','custom')),
  target_employee_ids  UUID[] NOT NULL DEFAULT '{}',
  expires_at           DATE,
  uploaded_by          UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_wp_docs_updated BEFORE UPDATE ON wp_docs
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();


-- ============================================================================
-- 13. BUSTE PAGA (per APP dipendente)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_payslips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period        TEXT NOT NULL,            -- 'YYYY-MM'
  file_path     TEXT NOT NULL,            -- Supabase Storage path
  password_hash TEXT,                     -- la pwd PDF è memorizzata cifrata
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, period)
);
CREATE INDEX IF NOT EXISTS idx_wp_payslips_emp ON wp_payslips(employee_id);


-- ============================================================================
-- 14. DOTAZIONI (DPI / Attrezzatura)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_equipment (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  serial       TEXT,
  assigned_at  DATE NOT NULL,
  returned_at  DATE,
  notes        TEXT
);
CREATE INDEX IF NOT EXISTS idx_wp_eq_emp ON wp_equipment(employee_id);


-- ============================================================================
-- 15. REPERIBILITÀ (CDZ / Uffici / RADIO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_oncall_shifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area          TEXT NOT NULL CHECK (area IN ('CDZ','Uffici','RADIO')),
  date          DATE NOT NULL,
  employee_id   UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  quadrimestre  SMALLINT NOT NULL CHECK (quadrimestre BETWEEN 1 AND 3),
  confirmed     BOOLEAN NOT NULL DEFAULT FALSE,  -- verde = true, giallo = false
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (area, date)
);
CREATE TRIGGER trg_wp_oncall_updated BEFORE UPDATE ON wp_oncall_shifts
  FOR EACH ROW EXECUTE FUNCTION wp_set_updated_at();
CREATE INDEX IF NOT EXISTS idx_wp_oncall_date ON wp_oncall_shifts(date);

-- Festivi (per calcolo reperibilità RADIO)
CREATE TABLE IF NOT EXISTS wp_holidays (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date  DATE UNIQUE NOT NULL,
  name  TEXT NOT NULL
);


-- ============================================================================
-- 16. AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS wp_audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity       TEXT NOT NULL,              -- 'wp_assignments', 'wp_leave_requests', ...
  entity_id    UUID,
  action       TEXT NOT NULL,              -- 'insert','update','delete','approve','reject'
  actor_pm_id  UUID REFERENCES wp_project_managers(id) ON DELETE SET NULL,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wp_audit_entity ON wp_audit_log(entity, entity_id);


-- ============================================================================
-- 17. RLS — Multi-tenancy per P.M.
-- ----------------------------------------------------------------------------
-- Ogni P.M. è collegato al proprio auth.users tramite wp_project_managers.auth_user_id.
-- Le policy filtrano per pm_id corrispondente all'utente loggato.
-- L'admin (ruolo HR) può vedere tutto.
-- ============================================================================

-- Helper: id P.M. dell'utente corrente
CREATE OR REPLACE FUNCTION wp_current_pm_id()
RETURNS UUID AS $$
  SELECT id FROM wp_project_managers WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: è admin/HR?
CREATE OR REPLACE FUNCTION wp_is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin','hr'),
    FALSE
  );
$$ LANGUAGE sql STABLE;

-- Anagrafiche condivise: lettura libera per utenti autenticati
ALTER TABLE wp_clients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_sites           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_vehicles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_project_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_squads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_cost_classes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_holidays        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_for_auth_clients"  ON wp_clients         FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_sites"    ON wp_sites           FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_vehicles" ON wp_vehicles        FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_pms"      ON wp_project_managers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_squads"   ON wp_squads          FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_cc"       ON wp_cost_classes    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_for_auth_holidays" ON wp_holidays        FOR SELECT USING (auth.uid() IS NOT NULL);

-- Scritture: solo admin / HR
CREATE POLICY "admin_write_clients"  ON wp_clients  FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_sites"    ON wp_sites    FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_vehicles" ON wp_vehicles FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_squads"   ON wp_squads   FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());

-- Assegnazioni: PM vede solo le proprie, admin tutto
ALTER TABLE wp_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_read_own_assignments" ON wp_assignments
  FOR SELECT USING (wp_is_admin() OR pm_id = wp_current_pm_id());
CREATE POLICY "pm_write_own_assignments" ON wp_assignments
  FOR ALL USING (wp_is_admin() OR pm_id = wp_current_pm_id())
  WITH CHECK (wp_is_admin() OR pm_id = wp_current_pm_id());

-- Richieste ferie/permessi: il PM vede quelle dei propri dipendenti
ALTER TABLE wp_leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_read_team_leaves" ON wp_leave_requests
  FOR SELECT USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "emp_write_own_leave" ON wp_leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "pm_approve_leave" ON wp_leave_requests
  FOR UPDATE USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
  );

-- Note / Timbrature: stessa logica
ALTER TABLE wp_employee_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_read_team_notes" ON wp_employee_notes
  FOR SELECT USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "emp_write_own_notes" ON wp_employee_notes
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

ALTER TABLE wp_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_read_team_entries" ON wp_time_entries
  FOR SELECT USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "emp_write_own_entries" ON wp_time_entries
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );
CREATE POLICY "pm_approve_entries" ON wp_time_entries
  FOR UPDATE USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
  );

-- Buste paga / Dotazioni: il dipendente vede le proprie, l'admin tutte
ALTER TABLE wp_payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self_or_admin_payslips" ON wp_payslips
  FOR SELECT USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

ALTER TABLE wp_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self_or_pm_equipment" ON wp_equipment
  FOR SELECT USING (
    wp_is_admin()
    OR employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
    OR employee_id IN (SELECT id FROM employees WHERE wp_pm_id = wp_current_pm_id())
  );

-- Documenti My Todos: ogni dipendente vede solo i propri (per visibility)
ALTER TABLE wp_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_docs_by_visibility" ON wp_docs
  FOR SELECT USING (
    wp_is_admin()
    OR visibility = 'all'
    OR (visibility = 'leaders' AND EXISTS (
          SELECT 1 FROM employees e
          WHERE e.auth_user_id = auth.uid() AND e.wp_is_leader = TRUE
       ))
    OR (visibility = 'custom' AND EXISTS (
          SELECT 1 FROM employees e
          WHERE e.auth_user_id = auth.uid() AND e.id = ANY(target_employee_ids)
       ))
  );

-- Reperibilità: lettura per tutti, scrittura admin
ALTER TABLE wp_oncall_shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_oncall_auth"  ON wp_oncall_shifts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_write_oncall" ON wp_oncall_shifts FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());

-- Mezzi: scadenze / tessere / telepass / pneumatici — lettura auth, scrittura admin
ALTER TABLE wp_vehicle_expiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_fuel_cards      ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_telepass        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wp_tires_storage   ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_vexp_auth"  ON wp_vehicle_expiries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_fc_auth"    ON wp_fuel_cards       FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_tp_auth"    ON wp_telepass         FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "read_tires_auth" ON wp_tires_storage    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_write_vexp"  ON wp_vehicle_expiries FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_fc"    ON wp_fuel_cards       FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_tp"    ON wp_telepass         FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());
CREATE POLICY "admin_write_tires" ON wp_tires_storage    FOR ALL USING (wp_is_admin()) WITH CHECK (wp_is_admin());


-- ============================================================================
-- 18. VISTE COMODE PER L'UI
-- ============================================================================

-- Pianificazione settimanale per P.M. — riga unica per dipendente/giorno
CREATE OR REPLACE VIEW wp_v_weekly_planning AS
SELECT
  a.id, a.date, a.employee_id, e.name AS employee_name, e.wp_code,
  e.wp_is_leader, e.wp_pm_id, a.site_id, s.code AS site_code, s.name AS site_name,
  s.is_maintenance, a.vehicle_id, v.plate AS vehicle_plate, v.model AS vehicle_model,
  a.special, a.notes, a.locked
FROM wp_assignments a
LEFT JOIN employees e   ON e.id = a.employee_id
LEFT JOIN wp_sites s    ON s.id = a.site_id
LEFT JOIN wp_vehicles v ON v.id = a.vehicle_id;

-- Scadenze unificate (mezzo / fuel / telepass) entro N giorni
CREATE OR REPLACE VIEW wp_v_upcoming_expiries AS
  SELECT 'mezzo'::text AS kind, e.id AS ref_id, v.plate || ' - ' || e.type AS label, e.due_date,
         CASE WHEN e.due_date IS NULL THEN 'missing'
              WHEN e.due_date < CURRENT_DATE THEN 'overdue'
              ELSE 'soon' END AS status
  FROM wp_vehicle_expiries e
  JOIN wp_vehicles v ON v.id = e.vehicle_id
  WHERE e.due_date IS NULL OR e.due_date <= CURRENT_DATE + INTERVAL '15 days'
UNION ALL
  SELECT 'fuel'::text, c.id, 'Tessera ' || c.supplier || ' ' || c.number, c.expires_at,
         CASE WHEN c.expires_at IS NULL THEN 'missing'
              WHEN c.expires_at < CURRENT_DATE THEN 'overdue'
              ELSE 'soon' END
  FROM wp_fuel_cards c
  WHERE c.is_active AND (c.expires_at IS NULL OR c.expires_at <= CURRENT_DATE + INTERVAL '15 days')
UNION ALL
  SELECT 'telepass'::text, t.id, 'Telepass ' || t.number, t.expires_at,
         CASE WHEN t.expires_at IS NULL THEN 'missing'
              WHEN t.expires_at < CURRENT_DATE THEN 'overdue'
              ELSE 'soon' END
  FROM wp_telepass t
  WHERE t.is_active AND (t.expires_at IS NULL OR t.expires_at <= CURRENT_DATE + INTERVAL '15 days');

-- Dipendenti del PM senza assegnazione nella settimana corrente
CREATE OR REPLACE VIEW wp_v_unassigned_this_week AS
SELECT e.id AS employee_id, e.name, e.wp_code, e.wp_is_leader, e.wp_pm_id
FROM employees e
WHERE e.wp_pm_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM wp_assignments a
    WHERE a.employee_id = e.id
      AND a.date >= date_trunc('week', CURRENT_DATE)::date
      AND a.date <= (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::date
  );


-- ============================================================================
-- FINE
-- ============================================================================
-- Nota: il bucket Supabase Storage da creare a parte:
--   - 'wp-docs'      → public read=false, RLS per visibility (vedi wp_docs)
--   - 'wp-payslips'  → public read=false, RLS strict (solo proprietario + admin)
-- ============================================================================
