-- 001_add_meta_abordador.sql
-- Adiciona meta_abordador na tabela lojas.
-- Regra do briefing #6: Meta = 0 → aba "Abordador" some da loja.

ALTER TABLE lojas
  ADD COLUMN IF NOT EXISTS meta_abordador integer NOT NULL DEFAULT 0;
