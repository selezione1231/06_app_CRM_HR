-- ============================================================================
-- TODOS HUB — F0 Notification Center
-- ----------------------------------------------------------------------------
-- Tabella unica per tutte le notifiche di sistema. Ogni modulo (HR, HSE,
-- IT, PM, Acquisti, ecc.) inserisce qui le sue notifiche; il NotificationCenter
-- nel header aggrega e filtra per utente.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Tabella principale
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Destinatari (uno dei due deve essere valorizzato)
  recipient_employee_id  UUID REFERENCES employees(id) ON DELETE CASCADE,
  recipient_role         TEXT REFERENCES roles_master(code) ON DELETE CASCADE,

  -- Origine
  source_module          TEXT NOT NULL,    -- 'hr','hse','it','pm','wp','acquisti','finance','servizi_gen','system'
  type                   TEXT NOT NULL,    -- 'leave_request','time_approval','expiry','document','rda','task','info','alert'
  priority               TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),

  -- Contenuto
  title                  TEXT NOT NULL,
  description            TEXT,
  action_label           TEXT,             -- es. "Vai alle approvazioni"
  action_url             TEXT,             -- /ops-app-leave?id=...

  -- Stato
  is_read                BOOLEAN NOT NULL DEFAULT FALSE,
  read_at                TIMESTAMPTZ,
  dismissed              BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_at           TIMESTAMPTZ,

  -- Riferimenti opzionali
  related_entity_type    TEXT,             -- 'leave_request','time_entry','vehicle','employee',...
  related_entity_id      UUID,
  sender_employee_id     UUID REFERENCES employees(id) ON DELETE SET NULL,

  -- Tempi
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at             TIMESTAMPTZ,

  CONSTRAINT chk_recipient CHECK (recipient_employee_id IS NOT NULL OR recipient_role IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_notif_recipient    ON notifications(recipient_employee_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notif_role         ON notifications(recipient_role) WHERE recipient_role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notif_created      ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_module_type  ON notifications(source_module, type);


-- ----------------------------------------------------------------------------
-- 2) View: notifiche per l'utente corrente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_my_notifications AS
SELECT n.*
FROM notifications n
LEFT JOIN employees e ON e.id = n.recipient_employee_id
WHERE
  -- Per dipendente diretto
  (n.recipient_employee_id IS NOT NULL AND e.auth_user_id = auth.uid())
  -- Per ruolo: se l'utente ha quel ruolo
  OR (n.recipient_role IS NOT NULL AND n.recipient_role = ANY(current_user_roles()))
ORDER BY n.created_at DESC;


-- ----------------------------------------------------------------------------
-- 3) RPC: mark read, dismiss, broadcast
-- ----------------------------------------------------------------------------

-- Segna come letta (solo destinatario o admin)
CREATE OR REPLACE FUNCTION notif_mark_read(notif_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
     SET is_read = TRUE, read_at = NOW()
   WHERE id = notif_id
     AND (
       has_role('admin')
       OR recipient_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
       OR (recipient_role IS NOT NULL AND recipient_role = ANY(current_user_roles()))
     );
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark all as read per l'utente corrente
CREATE OR REPLACE FUNCTION notif_mark_all_read()
RETURNS INTEGER AS $$
DECLARE n_updated INTEGER;
BEGIN
  UPDATE notifications
     SET is_read = TRUE, read_at = NOW()
   WHERE is_read = FALSE
     AND (
       recipient_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
       OR (recipient_role IS NOT NULL AND recipient_role = ANY(current_user_roles()))
     );
  GET DIAGNOSTICS n_updated = ROW_COUNT;
  RETURN n_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dismiss (rimuove dalla campanella senza eliminare dal DB)
CREATE OR REPLACE FUNCTION notif_dismiss(notif_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
     SET dismissed = TRUE, dismissed_at = NOW(), is_read = TRUE
   WHERE id = notif_id
     AND (
       has_role('admin')
       OR recipient_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid())
       OR (recipient_role IS NOT NULL AND recipient_role = ANY(current_user_roles()))
     );
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Broadcast a tutti gli utenti con un certo ruolo
CREATE OR REPLACE FUNCTION notif_broadcast_role(
  p_role          TEXT,
  p_source_module TEXT,
  p_type          TEXT,
  p_title         TEXT,
  p_description   TEXT DEFAULT NULL,
  p_action_label  TEXT DEFAULT NULL,
  p_action_url    TEXT DEFAULT NULL,
  p_priority      TEXT DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE new_id UUID;
BEGIN
  INSERT INTO notifications (
    recipient_role, source_module, type, priority,
    title, description, action_label, action_url
  ) VALUES (
    p_role, p_source_module, p_type, p_priority,
    p_title, p_description, p_action_label, p_action_url
  ) RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ----------------------------------------------------------------------------
-- 4) TRIGGER automatici: notifiche su eventi rilevanti
-- ----------------------------------------------------------------------------

-- Quando un dipendente crea una richiesta ferie/permesso → notifica al PM
CREATE OR REPLACE FUNCTION trg_notify_new_leave_request()
RETURNS TRIGGER AS $$
DECLARE
  v_pm_id        UUID;
  v_pm_emp_id    UUID;
  v_emp_name     TEXT;
BEGIN
  SELECT wp_pm_id, name INTO v_pm_id, v_emp_name
    FROM employees WHERE id = NEW.employee_id;
  IF v_pm_id IS NULL THEN RETURN NEW; END IF;

  -- Cerca un employee collegato a quel PM (best-effort)
  SELECT id INTO v_pm_emp_id FROM employees
   WHERE wp_pm_id = v_pm_id
     AND id IN (SELECT employee_id FROM employee_roles WHERE role_code = 'pm' AND revoked_at IS NULL)
   LIMIT 1;

  INSERT INTO notifications (
    recipient_employee_id, source_module, type, priority,
    title, description, action_label, action_url,
    related_entity_type, related_entity_id, sender_employee_id
  ) VALUES (
    v_pm_emp_id, 'wp', 'leave_request', 'high',
    'Nuova richiesta ' || NEW.type,
    v_emp_name || ' ha inviato una richiesta ' || NEW.type || ' dal ' || NEW.date_from::TEXT,
    'Vai alle approvazioni', '/ops-app-leave',
    'leave_request', NEW.id, NEW.employee_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_leave_request ON wp_leave_requests;
CREATE TRIGGER notify_new_leave_request
  AFTER INSERT ON wp_leave_requests
  FOR EACH ROW EXECUTE FUNCTION trg_notify_new_leave_request();

-- Quando il PM approva/rifiuta → notifica al dipendente
CREATE OR REPLACE FUNCTION trg_notify_leave_decision()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;
  IF NEW.status NOT IN ('Approved','Rejected') THEN RETURN NEW; END IF;

  INSERT INTO notifications (
    recipient_employee_id, source_module, type, priority,
    title, description, action_label, action_url,
    related_entity_type, related_entity_id
  ) VALUES (
    NEW.employee_id, 'wp', 'leave_decision',
    CASE WHEN NEW.status = 'Approved' THEN 'normal' ELSE 'high' END,
    'Richiesta ' || NEW.type || ' ' || CASE WHEN NEW.status = 'Approved' THEN 'approvata ✅' ELSE 'rifiutata ❌' END,
    'Periodo: ' || NEW.date_from::TEXT || COALESCE(' → ' || NEW.date_to::TEXT, ''),
    'Vedi le mie richieste', '/mie-richieste',
    'leave_request', NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_leave_decision ON wp_leave_requests;
CREATE TRIGGER notify_leave_decision
  AFTER UPDATE OF status ON wp_leave_requests
  FOR EACH ROW EXECUTE FUNCTION trg_notify_leave_decision();

-- Quando viene inserita una timbratura → notifica al PM
CREATE OR REPLACE FUNCTION trg_notify_new_time_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_pm_id     UUID;
  v_pm_emp_id UUID;
  v_emp_name  TEXT;
BEGIN
  SELECT wp_pm_id, name INTO v_pm_id, v_emp_name
    FROM employees WHERE id = NEW.employee_id;
  IF v_pm_id IS NULL THEN RETURN NEW; END IF;

  SELECT id INTO v_pm_emp_id FROM employees
   WHERE wp_pm_id = v_pm_id
     AND id IN (SELECT employee_id FROM employee_roles WHERE role_code = 'pm' AND revoked_at IS NULL)
   LIMIT 1;

  INSERT INTO notifications (
    recipient_employee_id, source_module, type, priority,
    title, description, action_label, action_url,
    related_entity_type, related_entity_id, sender_employee_id
  ) VALUES (
    v_pm_emp_id, 'wp', 'time_approval', 'normal',
    'Timbratura da approvare',
    v_emp_name || ' ha inserito ' || NEW.hours || 'h del ' || NEW.date::TEXT,
    'Vai alle approvazioni ore', '/ops-app-hours',
    'time_entry', NEW.id, NEW.employee_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_time_entry ON wp_time_entries;
CREATE TRIGGER notify_new_time_entry
  AFTER INSERT ON wp_time_entries
  FOR EACH ROW EXECUTE FUNCTION trg_notify_new_time_entry();

-- Note dipendenti → PM
CREATE OR REPLACE FUNCTION trg_notify_new_emp_note()
RETURNS TRIGGER AS $$
DECLARE
  v_pm_id     UUID;
  v_pm_emp_id UUID;
  v_emp_name  TEXT;
BEGIN
  SELECT wp_pm_id, name INTO v_pm_id, v_emp_name
    FROM employees WHERE id = NEW.employee_id;
  IF v_pm_id IS NULL THEN RETURN NEW; END IF;
  SELECT id INTO v_pm_emp_id FROM employees
   WHERE wp_pm_id = v_pm_id
     AND id IN (SELECT employee_id FROM employee_roles WHERE role_code = 'pm' AND revoked_at IS NULL)
   LIMIT 1;

  INSERT INTO notifications (
    recipient_employee_id, source_module, type, priority,
    title, description, action_label, action_url,
    related_entity_type, related_entity_id, sender_employee_id
  ) VALUES (
    v_pm_emp_id, 'wp', 'employee_note',
    CASE WHEN NEW.priority = 'high' THEN 'urgent' ELSE 'normal' END,
    CASE WHEN NEW.priority = 'high' THEN '⚠️ Nota urgente da ' ELSE 'Nuova nota da ' END || v_emp_name,
    LEFT(NEW.text, 140),
    'Vedi le note', '/ops-app-notes',
    'employee_note', NEW.id, NEW.employee_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notify_new_emp_note ON wp_employee_notes;
CREATE TRIGGER notify_new_emp_note
  AFTER INSERT ON wp_employee_notes
  FOR EACH ROW EXECUTE FUNCTION trg_notify_new_emp_note();


-- ----------------------------------------------------------------------------
-- 5) RLS
-- ----------------------------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_notifications" ON notifications
  FOR SELECT USING (
    has_role('admin')
    OR (recipient_employee_id IS NOT NULL AND recipient_employee_id IN (SELECT id FROM employees WHERE auth_user_id = auth.uid()))
    OR (recipient_role IS NOT NULL AND recipient_role = ANY(current_user_roles()))
  );

-- Solo le RPC (security definer) e admin scrivono
CREATE POLICY "admin_write_notifications" ON notifications
  FOR ALL USING (has_role('admin')) WITH CHECK (has_role('admin'));


-- ----------------------------------------------------------------------------
-- 6) Pulizia automatica: notifiche scadute > 60 giorni
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE n_deleted INTEGER;
BEGIN
  DELETE FROM notifications
   WHERE (dismissed = TRUE AND dismissed_at < NOW() - INTERVAL '60 days')
      OR (expires_at IS NOT NULL AND expires_at < NOW());
  GET DIAGNOSTICS n_deleted = ROW_COUNT;
  RETURN n_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FINE
-- ============================================================================
