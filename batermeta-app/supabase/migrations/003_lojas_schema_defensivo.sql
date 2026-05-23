-- 003_lojas_schema_defensivo.sql
-- Garante que a tabela `lojas` tem todas as colunas que o app
-- BaterMeta espera. Roda só os ALTERs que faltarem (IF NOT EXISTS).
--
-- O app espera o seguinte schema (snake_case):
--   id              integer/bigint PK
--   nome            text
--   login           text UNIQUE
--   senha           text          (plain text, conforme briefing)
--   ativa           boolean default true
--   tipo_periodo    text default 'diario'  -- 'diario' | 'semanal'
--   dias_uteis      integer default 21
--   semanas         integer default 4
--   meta_contratado numeric default 0
--   super_contratado numeric default 0
--   gold_contratado numeric default 0
--   meta_faturado   numeric default 0
--   super_faturado  numeric default 0
--   gold_faturado   numeric default 0
--   meta_abordador  integer default 0  (já incluso na 001)
--
-- Se você já tem alguma dessas colunas com outro nome ou tipo,
-- ajuste manualmente antes de rodar isso.

ALTER TABLE lojas
  ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS tipo_periodo text NOT NULL DEFAULT 'diario',
  ADD COLUMN IF NOT EXISTS dias_uteis integer NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS semanas integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS meta_contratado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS super_contratado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gold_contratado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_faturado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS super_faturado numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gold_faturado numeric NOT NULL DEFAULT 0;

-- Garante que login é único (evita login duplicado quebrar autenticação).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'lojas_login_key'
  ) THEN
    CREATE UNIQUE INDEX lojas_login_key ON lojas (login);
  END IF;
END$$;
