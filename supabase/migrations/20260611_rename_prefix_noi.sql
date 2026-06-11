-- ============================================================================
-- Rinomina ambiente: 06app_CRM_HR_* → 06app_Noi_*
-- Le policy RLS, indici e foreign key restano attaccati alle tabelle.
-- Applicata in produzione il 2026-06-11 via MCP (apply_migration).
-- ============================================================================

ALTER TABLE IF EXISTS "06app_CRM_HR_appointments"  RENAME TO "06app_Noi_appointments";
ALTER TABLE IF EXISTS "06app_CRM_HR_candidates"    RENAME TO "06app_Noi_candidates";
ALTER TABLE IF EXISTS "06app_CRM_HR_checklists"    RENAME TO "06app_Noi_checklists";
ALTER TABLE IF EXISTS "06app_CRM_HR_employees"     RENAME TO "06app_Noi_employees";
ALTER TABLE IF EXISTS "06app_CRM_HR_job_templates" RENAME TO "06app_Noi_job_templates";
ALTER TABLE IF EXISTS "06app_CRM_HR_jobs"          RENAME TO "06app_Noi_jobs";
ALTER TABLE IF EXISTS "06app_CRM_HR_leaves"        RENAME TO "06app_Noi_leaves";
ALTER TABLE IF EXISTS "06app_CRM_HR_notes"         RENAME TO "06app_Noi_notes";
ALTER TABLE IF EXISTS "06app_CRM_HR_performances"  RENAME TO "06app_Noi_performances";

-- Tabelle opzionali non ancora create in produzione (expenses, shifts,
-- vehicles, fuel_transactions): se esistono, rinominale comunque.
ALTER TABLE IF EXISTS "06app_CRM_HR_expenses"          RENAME TO "06app_Noi_expenses";
ALTER TABLE IF EXISTS "06app_CRM_HR_shifts"            RENAME TO "06app_Noi_shifts";
ALTER TABLE IF EXISTS "06app_CRM_HR_vehicles"          RENAME TO "06app_Noi_vehicles";
ALTER TABLE IF EXISTS "06app_CRM_HR_fuel_transactions" RENAME TO "06app_Noi_fuel_transactions";
