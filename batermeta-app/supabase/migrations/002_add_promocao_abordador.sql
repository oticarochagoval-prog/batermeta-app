-- 002_add_promocao_abordador.sql
-- Adiciona promocao na tabela abordadores.
-- Regra do briefing #7: PROMOÇÃO existe APENAS em Abordador.

ALTER TABLE abordadores
  ADD COLUMN IF NOT EXISTS promocao boolean NOT NULL DEFAULT false;
