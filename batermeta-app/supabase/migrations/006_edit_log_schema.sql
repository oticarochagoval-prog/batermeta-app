-- 006_edit_log_schema.sql
-- Garante que edit_log tem as colunas que o app usa.
-- Roda só os ALTERs que faltarem (IF NOT EXISTS).
--
-- Schema esperado:
--   id        (PK)
--   loja_id   (FK)
--   tipo      (text - categoria: 'contratado', 'faturado', etc.)
--   periodo   (text - data ISO ou 'S1'..'S4')
--   de        (text - valor antes formatado)
--   para      (text - valor depois formatado)
--   quem      (text - 'loja' ou 'master')
--   quando    (timestamptz default now())

ALTER TABLE edit_log
  ADD COLUMN IF NOT EXISTS tipo text,
  ADD COLUMN IF NOT EXISTS periodo text,
  ADD COLUMN IF NOT EXISTS de text,
  ADD COLUMN IF NOT EXISTS para text,
  ADD COLUMN IF NOT EXISTS quem text,
  ADD COLUMN IF NOT EXISTS quando timestamptz NOT NULL DEFAULT now();
